import { RecordSyncStatus } from "model";

import { AutoSyncStatus } from "./types";

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
