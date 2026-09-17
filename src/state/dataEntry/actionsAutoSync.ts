import NetInfo from "@react-native-community/netinfo";

import { Surveys } from "@openforis/arena-core";

import {
  RecordSyncStatus,
  RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy,
} from "model";
import { RecordService } from "service";
import { log } from "utils";

import { AutoSyncActions, AutoSyncStatus } from "../autoSync";
import { SurveySelectors } from "../survey";
import { ToastActions } from "../toast";
import { exportRecords } from "./actionsDataExport";
import { DataEntrySelectors } from "./selectors";

// records must have been idle (untouched) for at least this long before auto-sync will
// upload them, so a record that's still actively being edited is never touched
const AUTO_SYNC_IDLE_THRESHOLD_MS = 60_000; // 1 minute

// the record currently open in the editor gets a longer idle threshold instead of being
// excluded outright: otherwise a record edited slowly (a field every minute or two) would
// never leave "pending", however long it stays open - see selectAutoSyncCandidates
const AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS = 5 * 60_000; // 5 minutes

// a tick's real cost is RecordService.syncRecordSummaries, which asks the server about every
// local+remote record in the cycle (bandwidth/battery that scales with record count - can be a
// few thousand records for some surveys). Once nothing is known to be pending (status ===
// synced - kept fresh the instant something changes by AutoSyncActions.markPending, dispatched
// on every record create/edit), there's nothing new to upload, so ticks are throttled down to
// this much longer interval - just often enough to notice a record changed server-side (e.g.
// from another device) - instead of re-running that full check every AUTO_SYNC_INTERVAL_MS
// (see useAutoSyncMonitor) for nothing. A local edit breaks out of this immediately, since
// markPending flips the status away from "synced" as soon as it happens.
const AUTO_SYNC_SLOW_CHECK_INTERVAL_MS = 10 * 60_000; // 10 minutes

// syncStatus values that are safe to upload without any user confirmation: no merge, no
// overwrite of someone else's edit (mirrors the default "overwriteIfUpdated" bucket the
// manual "Send data" flow uses). Anything else (conflicting keys, modified on the server too)
// is deliberately left out here - those need the explicit merge confirmation the manual flow
// already has.
const autoSyncSafeStatuses = new Set([RecordSyncStatus.new, RecordSyncStatus.modifiedLocally]);

// guards against overlapping ticks (e.g. a slow network making one tick outlive the interval)
let tickInProgress = false;

// RecordService.syncRecordSummaries and RecordsUploadJob both surface the original HTTP status
// this way (see recordService.ts and remoteService.ts's withRetry) after a token refresh has
// already been attempted and failed
const isAuthError = (error: any) =>
  error?.status === 401 || error?.response?.status === 401;

const selectAutoSyncCandidates = ({ records, survey, currentlyEditedRecordUuid }: any) => {
  const errorsAllowed = Surveys.isRecordsWithErrorsUploadFromMobileAllowed(survey);
  const now = Date.now();

  return records.filter((record: any) => {
    if (!autoSyncSafeStatuses.has(record.syncStatus)) return false;
    if (!errorsAllowed && record.errors > 0) return false;

    const dateModified = record.dateModified ? new Date(record.dateModified) : null;
    if (!dateModified) return false;

    const isCurrentlyEdited = record.uuid === currentlyEditedRecordUuid;
    const idleThreshold = isCurrentlyEdited
      ? AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS
      : AUTO_SYNC_IDLE_THRESHOLD_MS;
    return now - dateModified.getTime() > idleThreshold;
  });
};

/**
 * One auto-sync tick: uploads, without any user interaction, the local records that have
 * been idle for a while (AUTO_SYNC_IDLE_THRESHOLD_MS, or the longer
 * AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS for the record currently open in the editor) and
 * free of any conflict with the server. Records that need a merge decision are left untouched
 * for the user to review/send manually. See the "Auto sync" checkbox in RecordsListOptions.
 * Ticks are a no-op most of the time once everything's caught up - see
 * AUTO_SYNC_SLOW_CHECK_INTERVAL_MS.
 */
const runAutoSync = () => async (dispatch: any, getState: any) => {
  if (tickInProgress) {
    log.debug("auto-sync: tick already in progress, skipping");
    return;
  }

  const state = getState();
  if (state.jobMonitor.isOpen) {
    log.debug("auto-sync: an export/import/upload is already running, skipping");
    return;
  }

  // a previous tick already found the stored credentials invalid, or a check already failed
  // for some other reason: don't hammer the server with more failing attempts, wait for the
  // user to act (log in again, or retry manually - see the sync status icon). Cleared by a
  // fresh login (RemoteConnectionActions' login/loginAndSetUser, see AutoSyncActions.reset) or
  // by a manual retry that succeeds (AutoSyncActions.checkEnd)
  if (
    state.autoSync.status === AutoSyncStatus.authError ||
    state.autoSync.status === AutoSyncStatus.checkError
  ) {
    log.debug(`auto-sync: last check ended in ${state.autoSync.status}, skipping until the user retries`);
    return;
  }

  // useAutoSyncMonitor only schedules ticks while the network is up, but that check can be
  // stale by the time this tick actually runs (e.g. connectivity dropped right as the interval
  // fired) - re-check right before starting so a tick never kicks off offline
  const netInfoState = await NetInfo.fetch();
  if (!netInfoState.isConnected) {
    log.debug("auto-sync: no network connection, skipping");
    return;
  }

  const survey = SurveySelectors.selectCurrentSurvey(state);
  const cycle = SurveySelectors.selectCurrentSurveyCycle(state);
  if (!survey || !Surveys.isRecordsUploadFromMobileAllowed(survey)) {
    log.debug("auto-sync: no survey selected, or uploads not allowed for it, skipping");
    return;
  }

  // nothing is known to be pending, and the last check was recent enough: skip the expensive
  // full status check (see AUTO_SYNC_SLOW_CHECK_INTERVAL_MS above)
  if (state.autoSync.status === AutoSyncStatus.synced) {
    const lastCheckedAtMs = state.autoSync.lastCheckedAt
      ? new Date(state.autoSync.lastCheckedAt).getTime()
      : 0;
    if (Date.now() - lastCheckedAtMs < AUTO_SYNC_SLOW_CHECK_INTERVAL_MS) {
      log.debug("auto-sync: already up to date, skipping check until the next slow check");
      return;
    }
  }

  tickInProgress = true;
  dispatch(AutoSyncActions.checkStart());
  log.debug(`auto-sync: tick starting (survey=${survey.uuid}, cycle=${cycle})`);
  try {
    const records = await RecordService.syncRecordSummaries({
      survey,
      cycle,
      onlyLocal: false,
    });
    log.debug(`auto-sync: fetched ${records.length} record summary(ies)`);
    dispatch(AutoSyncActions.checkEnd(records));

    const currentlyEditedRecordUuid = DataEntrySelectors.selectRecord(getState())?.uuid;

    const candidates = selectAutoSyncCandidates({
      records,
      survey,
      currentlyEditedRecordUuid,
    });
    if (candidates.length === 0) {
      log.debug("auto-sync: no record is a safe upload candidate, nothing to do");
      dispatch(
        AutoSyncActions.setStatusMessage("dataEntry:autoSync.status.noCandidatesMessage"),
      );
      return;
    }

    log.debug(
      `auto-sync: uploading ${candidates.length} record(s): ${candidates.map((r: any) => r.uuid).join(", ")}`,
    );

    const onJobComplete = () => {
      log.debug(`auto-sync: upload of ${candidates.length} record(s) completed`);
      dispatch(ToastActions.show("dataEntry:autoSync.synced", { count: candidates.length }));
    };

    // fire-and-forget, like the manual "Send data" flow: exportRecords resolves once the
    // upload has been handed off (it drives its own progress/completion internally via
    // onJobComplete), it does not await the remote upload finishing
    await dispatch(
      exportRecords({
        cycle,
        recordUuids: candidates.map((record: any) => record.uuid),
        conflictResolutionStrategy: ConflictResolutionStrategy.overwriteIfUpdated,
        onlyRemote: true,
        onJobComplete,
        silent: true,
      }),
    );
    log.debug("auto-sync: exportRecords handed off (zip preparation/upload continue in the job monitor)");
  } catch (error) {
    log.warn(`auto-sync: tick failed: ${error}`);
    if (isAuthError(error)) {
      // stop retrying until the user logs in again - see the guard at the top of this function
      dispatch(AutoSyncActions.authError());
    } else {
      // shown through the sync status icon; stops further ticks until the user retries
      // manually - see the guard at the top of this function
      dispatch(AutoSyncActions.checkError());
    }
  } finally {
    tickInProgress = false;
  }
};

export { runAutoSync };
