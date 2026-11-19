import { ArenaSurvey } from "@openforis/arena-core";

import {
  RecordWithSyncStatus,
  computeAutoSyncStatus,
  hasConflictingKeysWithMergeNotAllowed,
} from "./autoSyncStatusUtils";
import { AutoSyncSliceActions } from "./reducer";
import { AutoSyncStatus } from "./types";
import type { AppDispatch, AppGetState } from "../store";

// dispatched whenever records are about to be checked against the server (a manual "check
// status"/"send data" or a background auto-sync tick), so any screen can show a "checking..."
// state; also clears any message left over from the previous check (see setStatusMessage)
const checkStart = AutoSyncSliceActions.checkStart;

// dispatched once fresh sync statuses have been fetched, so any screen can show an up to date
// synced/pending/error summary without re-fetching it itself; the survey is needed to tell
// whether records with conflicting keys can be merged, the auto-sync setting to tell whether
// records modified on the server too get merged automatically (see computeAutoSyncStatus)
const checkEnd =
  ({
    records,
    survey,
  }: {
    records: RecordWithSyncStatus[];
    survey: ArenaSurvey;
  }) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    const autoSyncEnabled = !!getState().settings?.autoSyncEnabled;
    dispatch(
      AutoSyncSliceActions.checkEnd({
        status: computeAutoSyncStatus({ records, survey, autoSyncEnabled }),
        conflictingKeysWithMergeNotAllowed:
          hasConflictingKeysWithMergeNotAllowed({
            records,
            survey,
          }),
        lastCheckedAt: new Date().toISOString(),
      }),
    );
  };

// dispatched when a check couldn't even start (e.g. not logged in - already surfaced through
// its own dialog by the caller): clears the "checking" flag without claiming to know the up to
// date status, and without changing the status shown - see checkError for a check that did run
// but failed
const checkAborted = AutoSyncSliceActions.checkAborted;

// dispatched when a background auto-sync tick fails because its stored credentials are no
// longer valid (e.g. an expired session): further ticks are skipped (see runAutoSync) until the
// user logs in again, which resets this (see RemoteConnectionActions' login/loginAndSetUser,
// which dispatch AutoSyncActions.reset() on success)
const authError = AutoSyncSliceActions.authError;

// dispatched when a status check runs but fails for a reason other than an expired session (e.g.
// a server error): shown through the sync status icon instead of a blocking popup - avoids
// popping the same error dialog again every time an automatic re-check is triggered (screen
// focus, cycle change, ...). Further automatic checks are skipped (see
// useRecordsListLoad.checkAutoSyncStatusIfNeeded) until the user retries manually (any explicit
// "check status"/"send data" action dispatches checkStart/checkEnd/checkError again regardless)
const checkError = AutoSyncSliceActions.checkError;

// dispatched whenever the logged-in user (re)sets, e.g. after a fresh login: drops any
// previously remembered auth error so the next tick gets a fresh attempt instead of being
// skipped forever (see runAutoSync)
const reset = AutoSyncSliceActions.reset;

// a short, supplementary note about the outcome of the last completed tick/check - shown
// alongside (not instead of) the main status text, e.g. "nothing to send right now" after a
// check that found no record safe to auto-upload. Cleared by the next checkStart.
const setStatusMessage = (
  textKey: string,
  textParams?: Record<string, unknown>,
) => AutoSyncSliceActions.setStatusMessage({ textKey, textParams });

// dispatched right after a record is created or its content changes locally, so the status
// icon stops claiming "synced" the instant there's something new to upload, instead of only
// finding out at the next check (a background tick, up to AUTO_SYNC_INTERVAL_MS away, or a
// screen focus/refresh - see useAutoSyncMonitor and useRecordsList). This is optimistic: it
// doesn't know yet whether the record is actually a valid upload candidate (e.g. its key
// attributes may still be missing), only that it's no longer known to be in sync with the
// server; the next real check (checkEnd) reconciles it either way. An existing error is left
// alone since it still needs the user's attention and is more specific than "pending".
const markPending = () => (dispatch: AppDispatch, getState: AppGetState) => {
  const { status } = getState().autoSync;
  if (
    status === AutoSyncStatus.authError ||
    status === AutoSyncStatus.checkError
  ) {
    return;
  }
  dispatch(
    AutoSyncSliceActions.markPending({
      lastLocalChangeAt: new Date().toISOString(),
    }),
  );
};

const setDialogOpen = AutoSyncSliceActions.setDialogOpen;

export const AutoSyncActions = {
  checkStart,
  checkEnd,
  checkAborted,
  authError,
  checkError,
  reset,
  setStatusMessage,
  markPending,
  setDialogOpen,
};
