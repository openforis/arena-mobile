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

// statuses that need a manual merge/overwrite decision from the user (auto-sync never
// uploads these on its own - see selectAutoSyncCandidates in state/dataEntry/actionsAutoSync.ts)
const errorStatuses = new Set([
  RecordSyncStatus.conflictingKeys,
  RecordSyncStatus.keysNotSpecified,
  RecordSyncStatus.modifiedLocallyAndRemotely,
  RecordSyncStatus.modifiedRemotely,
  RecordSyncStatus.notInEntryStepAnymore,
]);

// statuses that are safe to auto-sync but haven't been uploaded yet
const pendingStatuses = new Set([
  RecordSyncStatus.new,
  RecordSyncStatus.modifiedLocally,
  RecordSyncStatus.notUpToDate,
]);

export const computeAutoSyncStatus = (
  records: RecordWithSyncStatus[],
): AutoSyncStatus => {
  if (
    records.some(
      (record) => !!record.syncStatus && errorStatuses.has(record.syncStatus),
    )
  ) {
    return AutoSyncStatus.error;
  }
  if (
    records.some(
      (record) =>
        !!record.syncStatus && pendingStatuses.has(record.syncStatus),
    )
  ) {
    return AutoSyncStatus.pending;
  }
  return AutoSyncStatus.synced;
};

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
