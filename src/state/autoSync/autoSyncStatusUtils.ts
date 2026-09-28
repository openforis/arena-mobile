import { Surveys } from "@openforis/arena-core";

import { RecordSyncStatus } from "model";

import { AutoSyncState, AutoSyncStatus } from "./types";

// a focus-triggered re-check (see useRecordsList.checkAutoSyncStatusIfNeeded) is skipped if one
// already ran within this long and nothing local has changed since - avoids hammering the
// server with a repeat check (and possible upload attempt) every time the user quickly bounces
// between the records list and another screen
export const AUTO_SYNC_FOCUS_RECHECK_MIN_INTERVAL_MS = 60_000; // 1 minute

// RecordService.syncRecordSummaries attaches syncStatus ad-hoc (no dedicated record-summary
// type exists in the codebase yet); this is the minimal shape this function actually reads.
// RecordSyncStatus is a plain object (not a TS enum), so its value type is derived this way.
type RecordWithSyncStatus = {
  syncStatus?: (typeof RecordSyncStatus)[keyof typeof RecordSyncStatus];
};

// statuses auto-sync never uploads on its own (see selectAutoSyncCandidates in
// state/dataEntry/actionsAutoSync.ts) but that the user can resolve from this device with an
// explicit merge through "Send data" (see useRecordsExport)
const mergeableStatuses = new Set([
  RecordSyncStatus.modifiedLocallyAndRemotely,
  RecordSyncStatus.modifiedRemotely,
]);

// statuses no upload/merge can resolve: the record itself needs fixing (e.g. its key values
// filled in or changed), deleting, or leaving alone (e.g. it's already past the entry step on
// the server). conflictingKeys belongs here too when the survey doesn't allow merging records
// with the same key(s) (see getNeedsManualFixStatuses)
const alwaysNeedsManualFixStatuses = [
  RecordSyncStatus.keysNotSpecified,
  RecordSyncStatus.notInEntryStepAnymore,
];

// statuses that are safe to auto-sync but haven't been uploaded yet
const pendingStatuses = new Set([
  RecordSyncStatus.new,
  RecordSyncStatus.modifiedLocally,
  RecordSyncStatus.notUpToDate,
]);

const getMergeableStatuses = ({
  mergeWithSameKeysAllowed,
}: {
  mergeWithSameKeysAllowed: boolean;
}) =>
  mergeWithSameKeysAllowed
    ? new Set([...mergeableStatuses, RecordSyncStatus.conflictingKeys])
    : mergeableStatuses;

const getNeedsManualFixStatuses = ({
  mergeWithSameKeysAllowed,
}: {
  mergeWithSameKeysAllowed: boolean;
}) =>
  new Set(
    mergeWithSameKeysAllowed
      ? alwaysNeedsManualFixStatuses
      : [...alwaysNeedsManualFixStatuses, RecordSyncStatus.conflictingKeys],
  );

const someRecordHasStatus = (
  records: RecordWithSyncStatus[],
  statuses: Set<string>,
) =>
  records.some(
    (record) => !!record.syncStatus && statuses.has(record.syncStatus),
  );

// precedence: records resolvable right away through "Send data" (error) first, then records
// that will be sent automatically (pending - transient), then records that only the user can
// fix outside of any sync (needsManualFix), which would otherwise hide behind "synced"
export const computeAutoSyncStatus = ({
  records,
  survey,
}: {
  records: RecordWithSyncStatus[];
  survey: any;
}): AutoSyncStatus => {
  const mergeWithSameKeysAllowed =
    Surveys.isRecordsMergeWithSameKeysAllowed(survey);
  if (
    someRecordHasStatus(records, getMergeableStatuses({ mergeWithSameKeysAllowed }))
  ) {
    return AutoSyncStatus.error;
  }
  if (someRecordHasStatus(records, pendingStatuses)) {
    return AutoSyncStatus.pending;
  }
  if (
    someRecordHasStatus(records, getNeedsManualFixStatuses({ mergeWithSameKeysAllowed }))
  ) {
    return AutoSyncStatus.needsManualFix;
  }
  return AutoSyncStatus.synced;
};

// true if some records can't be sent only because they have the same key(s) as a record already
// on the server and the survey doesn't allow merging them: unlike the other needsManualFix cases,
// the user may need the survey administrator (to allow merging) rather than a local fix
export const hasConflictingKeysWithMergeNotAllowed = ({
  records,
  survey,
}: {
  records: RecordWithSyncStatus[];
  survey: any;
}): boolean =>
  !Surveys.isRecordsMergeWithSameKeysAllowed(survey) &&
  records.some((record) => record.syncStatus === RecordSyncStatus.conflictingKeys);

// true if a check already completed recently enough (AUTO_SYNC_FOCUS_RECHECK_MIN_INTERVAL_MS)
// and nothing local has changed since - see useRecordsList.checkAutoSyncStatusIfNeeded, the only
// caller that needs this (the periodic background tick and "Sync now" have their own, different
// throttling/semantics and must run regardless of this one)
export const wasRecentlyCheckedWithNoNewLocalChanges = ({
  lastCheckedAt,
  lastLocalChangeAt,
}: Pick<AutoSyncState, "lastCheckedAt" | "lastLocalChangeAt">): boolean => {
  if (!lastCheckedAt) return false;
  const lastCheckedAtMs = new Date(lastCheckedAt).getTime();
  if (Date.now() - lastCheckedAtMs >= AUTO_SYNC_FOCUS_RECHECK_MIN_INTERVAL_MS) return false;
  return !lastLocalChangeAt || new Date(lastLocalChangeAt).getTime() <= lastCheckedAtMs;
};

// RecordService.syncRecordSummaries and RecordsUploadJob both surface the original HTTP status
// this way (see recordService.ts and remoteService.ts's withRetry) after a token refresh has
// already been attempted and failed
export const isAuthError = (error: any) =>
  error?.status === 401 || error?.response?.status === 401;
