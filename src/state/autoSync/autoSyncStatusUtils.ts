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

// statuses of a record changed on the server too since this device last synced it: resolved by
// merging it with its own server copy (same record uuid), either explicitly through "Send data"
// (see useRecordsExport) or, when auto-merge is on (see isAutoMergeAllowed), by auto-sync itself
// (see selectAutoMergeCandidates in state/dataEntry/actionsAutoSync.ts)
export const sameRecordMergeableStatuses = new Set<string>([
  RecordSyncStatus.modifiedLocallyAndRemotely,
  RecordSyncStatus.modifiedRemotely,
]);

// auto-sync can merge a record with its own server copy without asking only if it's then able to
// replace the local copy with the merged one, which is a download of that record from the server
export const isAutoMergeAllowed = ({
  autoSyncEnabled,
  survey,
}: {
  autoSyncEnabled: boolean;
  survey: any;
}): boolean =>
  autoSyncEnabled &&
  Surveys.isVisibleInMobile(survey) &&
  Surveys.isRecordsDownloadInMobileAllowed(survey);

// statuses no upload/merge can resolve: the record itself needs fixing (e.g. its key values
// filled in or changed), deleting, or leaving alone (e.g. it's already past the entry step on
// the server). conflictingKeys belongs here too when the survey doesn't allow merging records
// with the same key(s) (see getNeedsManualFixStatuses)
const alwaysNeedsManualFixStatuses = [
  RecordSyncStatus.keysNotSpecified,
  RecordSyncStatus.notInEntryStepAnymore,
];

// statuses that are safe to auto-sync but haven't been uploaded yet
const pendingStatuses = new Set<string>([
  RecordSyncStatus.new,
  RecordSyncStatus.modifiedLocally,
  RecordSyncStatus.notUpToDate,
]);

// statuses that need an explicit merge decision through "Send data": never the same-record ones
// when auto-sync merges those on its own
const getMergeableStatuses = ({
  autoMergeAllowed,
  mergeWithSameKeysAllowed,
}: {
  autoMergeAllowed: boolean;
  mergeWithSameKeysAllowed: boolean;
}) =>
  new Set<string>([
    ...(autoMergeAllowed ? [] : sameRecordMergeableStatuses),
    ...(mergeWithSameKeysAllowed ? [RecordSyncStatus.conflictingKeys] : []),
  ]);

const getPendingStatuses = ({ autoMergeAllowed }: { autoMergeAllowed: boolean }) =>
  autoMergeAllowed
    ? new Set<string>([...pendingStatuses, ...sameRecordMergeableStatuses])
    : pendingStatuses;

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
  autoSyncEnabled = false,
}: {
  records: RecordWithSyncStatus[];
  survey: any;
  autoSyncEnabled?: boolean;
}): AutoSyncStatus => {
  const mergeWithSameKeysAllowed =
    Surveys.isRecordsMergeWithSameKeysAllowed(survey);
  const autoMergeAllowed = isAutoMergeAllowed({ autoSyncEnabled, survey });
  if (
    someRecordHasStatus(
      records,
      getMergeableStatuses({ autoMergeAllowed, mergeWithSameKeysAllowed }),
    )
  ) {
    return AutoSyncStatus.error;
  }
  if (someRecordHasStatus(records, getPendingStatuses({ autoMergeAllowed }))) {
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
