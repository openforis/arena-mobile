import { computeAutoSyncStatus } from "./autoSyncStatusUtils";
import { AutoSyncStatus } from "./types";

const AUTO_SYNC_CHECK_START = "AUTO_SYNC_CHECK_START";
const AUTO_SYNC_CHECK_END = "AUTO_SYNC_CHECK_END";
const AUTO_SYNC_CHECK_ABORTED = "AUTO_SYNC_CHECK_ABORTED";
const AUTO_SYNC_AUTH_ERROR = "AUTO_SYNC_AUTH_ERROR";
const AUTO_SYNC_CHECK_ERROR = "AUTO_SYNC_CHECK_ERROR";
const AUTO_SYNC_RESET = "AUTO_SYNC_RESET";
const AUTO_SYNC_STATUS_MESSAGE_SET = "AUTO_SYNC_STATUS_MESSAGE_SET";

// dispatched whenever records are about to be checked against the server (a manual "check
// status"/"send data" or a background auto-sync tick), so any screen can show a "checking..."
// state; also clears any message left over from the previous check (see setStatusMessage)
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

// dispatched when a check couldn't even start (e.g. not logged in - already surfaced through
// its own dialog by the caller): clears the "checking" flag without claiming to know the up to
// date status, and without changing the status shown - see checkError for a check that did run
// but failed
const checkAborted = () => ({ type: AUTO_SYNC_CHECK_ABORTED });

// dispatched when a background auto-sync tick fails because its stored credentials are no
// longer valid (e.g. an expired session): further ticks are skipped (see runAutoSync) until the
// user logs in again, which resets this (see RemoteConnectionActions' login/loginAndSetUser,
// which dispatch AutoSyncActions.reset() on success)
const authError = () => ({
  type: AUTO_SYNC_AUTH_ERROR,
  payload: { status: AutoSyncStatus.authError },
});

// dispatched when a status check runs but fails for a reason other than an expired session (e.g.
// a server error): shown through the sync status icon instead of a blocking popup - avoids
// popping the same error dialog again every time an automatic re-check is triggered (screen
// focus, cycle change, ...). Further automatic checks are skipped (see
// useRecordsList.checkAutoSyncStatusIfNeeded) until the user retries manually (any explicit
// "check status"/"send data" action dispatches checkStart/checkEnd/checkError again regardless)
const checkError = () => ({
  type: AUTO_SYNC_CHECK_ERROR,
  payload: { status: AutoSyncStatus.checkError },
});

// dispatched whenever the logged-in user (re)sets, e.g. after a fresh login: drops any
// previously remembered auth error so the next tick gets a fresh attempt instead of being
// skipped forever (see runAutoSync)
const reset = () => ({ type: AUTO_SYNC_RESET });

// a short, supplementary note about the outcome of the last completed tick/check - shown
// alongside (not instead of) the main status text, e.g. "nothing to send right now" after a
// check that found no record safe to auto-upload. Cleared by the next checkStart.
const setStatusMessage = (textKey: string, textParams?: Record<string, any>) => ({
  type: AUTO_SYNC_STATUS_MESSAGE_SET,
  payload: { message: { textKey, textParams } },
});

export const AutoSyncActions = {
  AUTO_SYNC_CHECK_START,
  AUTO_SYNC_CHECK_END,
  AUTO_SYNC_CHECK_ABORTED,
  AUTO_SYNC_AUTH_ERROR,
  AUTO_SYNC_CHECK_ERROR,
  AUTO_SYNC_RESET,
  AUTO_SYNC_STATUS_MESSAGE_SET,

  checkStart,
  checkEnd,
  checkAborted,
  authError,
  checkError,
  reset,
  setStatusMessage,
};
