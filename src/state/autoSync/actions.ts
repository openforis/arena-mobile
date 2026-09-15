import { computeAutoSyncStatus } from "./autoSyncStatusUtils";

const AUTO_SYNC_CHECK_START = "AUTO_SYNC_CHECK_START";
const AUTO_SYNC_CHECK_END = "AUTO_SYNC_CHECK_END";
const AUTO_SYNC_CHECK_ABORTED = "AUTO_SYNC_CHECK_ABORTED";

// dispatched whenever records are about to be checked against the server (a manual "check
// status"/"send data" or a background auto-sync tick), so any screen can show a "checking..." state
const checkStart = () => ({ type: AUTO_SYNC_CHECK_START });

// dispatched once fresh sync statuses have been fetched, so any screen can show an up to date
// synced/pending/error summary without re-fetching it itself
const checkEnd = (records: any[]) => ({
  type: AUTO_SYNC_CHECK_END,
  payload: {
    status: computeAutoSyncStatus(records),
    lastCheckedAt: new Date().toISOString(),
  },
});

// dispatched when a check couldn't complete (not logged in, network error): clears the
// "checking" flag without claiming to know the up to date status
const checkAborted = () => ({ type: AUTO_SYNC_CHECK_ABORTED });

export const AutoSyncActions = {
  AUTO_SYNC_CHECK_START,
  AUTO_SYNC_CHECK_END,
  AUTO_SYNC_CHECK_ABORTED,

  checkStart,
  checkEnd,
  checkAborted,
};
