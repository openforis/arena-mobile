import { ArenaSurvey, Surveys, ArenaValidation } from "@openforis/arena-core";

import { RecordSummaries, RecordSyncStatus } from "model";
import type { SettingsObject } from "model";

import {
  hasOnlyRemoteChanges,
  isAutoMergeAllowed,
  sameRecordMergeableStatuses,
} from "../autoSync/autoSyncStatusUtils";
import { AutoSyncState, AutoSyncStatus } from "../autoSync/types";

// the record currently open in the editor gets an idle threshold instead of being excluded
// outright: otherwise a record edited slowly (a field every minute or two) would never leave
// "pending", however long it stays open - see selectAutoSyncCandidates. Any other record isn't
// being actively edited (whether it never was, or the user has since navigated away from it),
// so it's a candidate as soon as it's otherwise eligible - no extra waiting period. The actual
// value is user-configurable (settings:autoSyncOpenRecordIntervalMinutes), this is only the
// fallback used if the setting is somehow missing.
const AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS_DEFAULT = 5 * 60_000; // 5 minutes

// a tick's real cost is RecordService.syncRecordSummaries, which asks the server about every
// local+remote record in the cycle (bandwidth/battery that scales with record count - can be a
// few thousand records for some surveys). Once nothing is known to be pending (status ===
// synced, or needsManualFix: only records no sync can resolve are left - kept fresh the
// instant something changes by AutoSyncActions.markPending, dispatched on every record
// create/edit), there's nothing new to upload, so ticks are throttled down to
// this much longer interval - just often enough to notice a record changed server-side (e.g.
// from another device) - instead of re-running that full check every AUTO_SYNC_INTERVAL_MS
// (see useAutoSyncMonitor) for nothing. A local edit breaks out of this immediately, since
// markPending flips the status away from "synced"/"needsManualFix" as soon as it happens. The actual value is
// user-configurable (settings:autoSyncSlowCheckIntervalMinutes), this is only the fallback
// used if the setting is somehow missing.
const AUTO_SYNC_SLOW_CHECK_INTERVAL_MS_DEFAULT = 30 * 60_000; // 30 minutes

// syncStatus values that are safe to upload without any user confirmation: no merge, no
// overwrite of someone else's edit (mirrors the default "overwriteIfUpdated" bucket the
// manual "Send data" flow uses). Records modified on the server too are handled separately
// (see selectAutoMergeCandidates); records with conflicting keys are deliberately left out -
// those need the explicit merge confirmation the manual flow already has.
const autoSyncSafeStatuses = new Set<string>([
  RecordSyncStatus.new,
  RecordSyncStatus.modifiedLocally,
]);

// the record open in the editor is merged only if it hasn't been modified for at least this long,
// even when the user-configurable idle threshold is bypassed ("Sync now"): an edit could still be
// on its way to the device storage
export const OPEN_RECORD_MERGE_MIN_IDLE_MS = 5000;

// the fields of a record summary (with sync status) that auto-sync reads
export type AutoSyncRecord = {
  uuid: string;
  readOnly?: boolean;
  syncStatus?: string;
  validation?: ArenaValidation | null;
  dateModified?: string | number;
  dateModifiedSynced?: string | null;
};

type CandidatesParams = {
  records: AutoSyncRecord[];
  survey: ArenaSurvey;
  currentlyEditedRecordUuid?: string;
};

type AutoMergeParams = CandidatesParams & { autoSyncEnabled: boolean };

export const getAutoSyncIntervalsMs = (
  settings: Partial<
    Pick<
      SettingsObject,
      "autoSyncOpenRecordIntervalMinutes" | "autoSyncSlowCheckIntervalMinutes"
    >
  > = {},
) => {
  const {
    autoSyncOpenRecordIntervalMinutes,
    autoSyncSlowCheckIntervalMinutes,
  } = settings;
  return {
    openRecordIdleThresholdMs: autoSyncOpenRecordIntervalMinutes
      ? autoSyncOpenRecordIntervalMinutes * 60_000
      : AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS_DEFAULT,
    slowCheckIntervalMs: autoSyncSlowCheckIntervalMinutes
      ? autoSyncSlowCheckIntervalMinutes * 60_000
      : AUTO_SYNC_SLOW_CHECK_INTERVAL_MS_DEFAULT,
  };
};

// nothing is known to be pending, and the last check was recent enough: the expensive full
// status check (RecordService.syncRecordSummaries) can be skipped - see slowCheckIntervalMs
// needsManualFix counts as up to date too: the records behind it can't be uploaded until the
// user edits them (which dispatches markPending, breaking out of this right away), so a full
// check every tick would only find the same unresolvable records again
const upToDateStatuses = new Set([
  AutoSyncStatus.synced,
  AutoSyncStatus.needsManualFix,
]);

export const isAlreadyUpToDate = ({
  autoSyncState,
  slowCheckIntervalMs,
}: {
  autoSyncState: Pick<AutoSyncState, "status" | "lastCheckedAt">;
  slowCheckIntervalMs: number;
}): boolean => {
  if (!upToDateStatuses.has(autoSyncState.status)) return false;
  const lastCheckedAtMs = autoSyncState.lastCheckedAt
    ? new Date(autoSyncState.lastCheckedAt).getTime()
    : 0;
  return Date.now() - lastCheckedAtMs < slowCheckIntervalMs;
};

export const isRecordIdle = ({
  record,
  now,
  idleThresholdMs,
}: {
  record: AutoSyncRecord;
  now: number;
  idleThresholdMs: number;
}): boolean => {
  const dateModified = record.dateModified
    ? new Date(record.dateModified)
    : null;
  if (!dateModified) return idleThresholdMs < 0;

  return now - dateModified.getTime() > idleThresholdMs;
};

const isUploadAllowedWithErrors = ({
  record,
  errorsAllowed,
}: {
  record: AutoSyncRecord;
  errorsAllowed: boolean;
}) => errorsAllowed || !RecordSummaries.hasErrors(record);

export const selectAutoSyncCandidates = ({
  records,
  survey,
  currentlyEditedRecordUuid,
  openRecordIdleThresholdMs,
}: CandidatesParams & {
  openRecordIdleThresholdMs: number;
}): AutoSyncRecord[] => {
  const errorsAllowed =
    Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey);
  const now = Date.now();

  return records.filter((record) => {
    // records of other user groups cannot be uploaded
    if (record.readOnly) return false;
    if (!record.syncStatus || !autoSyncSafeStatuses.has(record.syncStatus))
      return false;
    if (!isUploadAllowedWithErrors({ record, errorsAllowed })) return false;

    // only the record currently open in the editor needs an idle grace period (it may still be
    // mid-edit); any other record isn't being actively edited right now, so it's a candidate
    // regardless of how recently it was last modified
    if (record.uuid !== currentlyEditedRecordUuid) return true;

    return isRecordIdle({
      record,
      now,
      idleThresholdMs: openRecordIdleThresholdMs,
    });
  });
};

// records modified on the server too since this device last synced them (e.g. by another user):
// instead of being left for the user to merge explicitly through "Send data", they're sent to be
// merged with their own server copy (same record uuid), then replaced in the device by the merged
// version (see exportRecords' onJobComplete). The record open in the editor is a candidate only
// once idle, same as for a plain upload (see selectAutoSyncCandidates): it's then made read-only
// until the merged version is loaded in the editor (see uploadAutoMergeCandidates).
export const selectAutoMergeCandidates = ({
  records,
  survey,
  autoSyncEnabled,
  currentlyEditedRecordUuid,
  openRecordIdleThresholdMs,
}: AutoMergeParams & {
  openRecordIdleThresholdMs: number;
}): AutoSyncRecord[] => {
  if (!isAutoMergeAllowed({ autoSyncEnabled, survey })) return [];
  const errorsAllowed =
    Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey);
  const now = Date.now();
  const idleThresholdMs = Math.max(
    openRecordIdleThresholdMs,
    OPEN_RECORD_MERGE_MIN_IDLE_MS,
  );

  return records.filter(
    (record) =>
      !record.readOnly &&
      !!record.syncStatus &&
      sameRecordMergeableStatuses.has(record.syncStatus) &&
      !hasOnlyRemoteChanges(record) &&
      isUploadAllowedWithErrors({ record, errorsAllowed }) &&
      (record.uuid !== currentlyEditedRecordUuid ||
        isRecordIdle({ record, now, idleThresholdMs })),
  );
};

// the open record is picked up by a later tick, once closed
export const selectAutoFetchCandidates = ({
  records,
  survey,
  autoSyncEnabled,
  currentlyEditedRecordUuid,
}: AutoMergeParams): AutoSyncRecord[] =>
  isAutoMergeAllowed({ autoSyncEnabled, survey })
    ? records.filter(
        (record) =>
          hasOnlyRemoteChanges(record) &&
          record.uuid !== currentlyEditedRecordUuid,
      )
    : [];
