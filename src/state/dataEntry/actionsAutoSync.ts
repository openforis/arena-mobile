import NetInfo from "@react-native-community/netinfo";

import { ArenaSurvey, Surveys } from "@openforis/arena-core";

import { RecordUpdateConflictResolutionStrategy as ConflictResolutionStrategy } from "model";
import { RecordService } from "service";
import { log } from "utils";
import { HttpErrors } from "utils/HttpErrors";

import { AutoSyncActions, AutoSyncStatus } from "../autoSync";
import { SurveySelectors } from "../survey";
import { ToastActions } from "../toast";
import { exportRecords } from "./actionsDataExport";
import { fetchRecordsChangedRemotely } from "./actionsMergedRecords";
import { DataEntryActionsRecordSync } from "./actionsRecordSync";
import {
  AutoSyncRecord,
  getAutoSyncIntervalsMs,
  isAlreadyUpToDate,
  selectAutoFetchCandidates,
  selectAutoMergeCandidates,
  selectAutoSyncCandidates,
} from "./autoSyncCandidates";
import { DataEntrySelectors } from "./selectors";
import type { AppDispatch, AppGetState } from "../store";

type ThunkApi = { dispatch: AppDispatch; getState: AppGetState };

type UploadParams = ThunkApi & {
  cycle: string;
  candidates: AutoSyncRecord[];
};

// guards against overlapping ticks (e.g. a slow network making one tick outlive the interval)
let tickInProgress = false;

// a previous tick already found the stored credentials invalid, or a check already failed for
// some other reason: don't hammer the server with more failing attempts, wait for the user to
// act (log in again, or retry manually - see the sync status icon). Cleared by a fresh login
// (RemoteConnectionActions' login/loginAndSetUser, see AutoSyncActions.reset) or by a manual
// retry that succeeds (AutoSyncActions.checkEnd)
const isTickBlockedByPreviousError = (autoSyncStatus: AutoSyncStatus) =>
  autoSyncStatus === AutoSyncStatus.authError ||
  autoSyncStatus === AutoSyncStatus.checkError;

const isUploadAllowedForSurvey = (survey: ArenaSurvey) =>
  Surveys.isRecordsUploadFromMobileAllowed(survey);

const refreshAutoSyncStatus = async ({ dispatch, getState }: ThunkApi) => {
  try {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const cycle = SurveySelectors.selectCurrentSurveyCycle(state);
    if (!survey) return;
    const records = await RecordService.syncRecordSummaries({
      survey,
      cycle,
      onlyLocal: false,
    });
    dispatch(AutoSyncActions.checkEnd({ records, survey }));
  } catch (error) {
    log.warn(`auto-sync: status refresh after upload failed: ${error}`);
  }
};

const uploadAutoSyncCandidates = async ({
  dispatch,
  getState,
  cycle,
  candidates,
  conflictResolutionStrategy = ConflictResolutionStrategy.overwriteIfUpdated,
  onUploadComplete = undefined,
}: UploadParams & {
  conflictResolutionStrategy?: string;
  onUploadComplete?: () => void;
}) => {
  log.debug(
    `auto-sync: uploading ${candidates.length} record(s) (${conflictResolutionStrategy}): ${candidates.map((r) => r.uuid).join(", ")}`,
  );

  const onJobComplete = () => {
    log.debug(`auto-sync: upload of ${candidates.length} record(s) completed`);
    onUploadComplete?.();
    // the toast would only be shown behind/over the dialog, dimming it: the dialog already
    // reports the outcome
    if (!getState().autoSync.dialogOpen) {
      dispatch(
        ToastActions.show("dataEntry:autoSync.synced", {
          count: candidates.length,
        }),
      );
    }
    // refresh the status icon right away (e.g. pending -> synced) instead of waiting for the next tick
    void refreshAutoSyncStatus({ dispatch, getState });
  };

  // fire-and-forget, like the manual "Send data" flow: exportRecords resolves once the upload
  // has been handed off (it drives its own progress/completion internally via onJobComplete),
  // it does not await the remote upload finishing
  await dispatch(
    exportRecords({
      cycle,
      recordUuids: candidates.map((record) => record.uuid),
      conflictResolutionStrategy,
      onlyRemote: true,
      onJobComplete,
      silent: true,
    }),
  );
  log.debug(
    "auto-sync: exportRecords handed off (zip preparation/upload continue in the job monitor)",
  );
};

const handleAutoSyncTickError = ({
  dispatch,
  error,
}: {
  dispatch: AppDispatch;
  error: unknown;
}) => {
  log.warn(`auto-sync: tick failed: ${error}`);
  if (HttpErrors.isUnauthorized(error)) {
    // stop retrying until the user logs in again - see the guard at the top of runAutoSync
    dispatch(AutoSyncActions.authError());
  } else {
    // shown through the sync status icon; stops further ticks until the user retries manually
    // - see the guard at the top of runAutoSync
    dispatch(AutoSyncActions.checkError());
  }
};

// the record open in the editor, when among the records to merge, can't be edited from now until
// its merged version is loaded in the editor (done by exportRecords' onJobComplete, which runs
// before the onJobComplete passed here): an edit made in the meantime would overwrite the merged
// version with the pre-merge content. Any other way the upload can end is covered by the lock's
// own watchdog (see lockOpenRecordForSync).
const uploadAutoMergeCandidates = async ({
  dispatch,
  getState,
  cycle,
  candidates,
  currentlyEditedRecordUuid,
}: UploadParams & { currentlyEditedRecordUuid?: string }) => {
  const openRecordIncluded = candidates.some(
    (record) => record.uuid === currentlyEditedRecordUuid,
  );
  if (openRecordIncluded) {
    dispatch(
      DataEntryActionsRecordSync.lockOpenRecordForSync({
        isBusy: () => tickInProgress,
      }),
    );
  }
  await uploadAutoSyncCandidates({
    dispatch,
    getState,
    cycle,
    candidates,
    conflictResolutionStrategy: ConflictResolutionStrategy.merge,
    onUploadComplete: openRecordIncluded
      ? () => dispatch(DataEntryActionsRecordSync.unlockOpenRecordAfterSync())
      : undefined,
  });
};

/**
 * One auto-sync tick: uploads, without any user interaction, the local records that aren't
 * currently open in the editor (or, for the one that is, has been idle for a while - the
 * longer, user-configurable settings:autoSyncOpenRecordIntervalMinutes) and free of any
 * conflict with the server. Records modified on the server too are merged with their server
 * copy (see selectAutoMergeCandidates), in a tick of their own; records with the same key(s) as
 * another record on the server are left untouched for the user to review/send manually. See the "Auto sync" checkbox in RecordsListOptions. Ticks are a
 * no-op most of the time once everything's caught up - see
 * settings:autoSyncSlowCheckIntervalMinutes.
 * `prefetchedRecords`: record summaries (with sync status) the caller has just fetched and
 * already dispatched through AutoSyncActions.checkEnd (e.g. the records list refreshing on
 * focus) - reused as-is instead of fetching them again right away.
 */
const runAutoSync =
  ({
    ignoreOpenRecordIdleThreshold = false,
    prefetchedRecords,
  }: {
    ignoreOpenRecordIdleThreshold?: boolean;
    prefetchedRecords?: AutoSyncRecord[];
  } = {}) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    if (tickInProgress) {
      log.debug("auto-sync: tick already in progress, skipping");
      return;
    }

    const state = getState();
    if (
      state.jobMonitor.isOpen ||
      DataEntryActionsRecordSync.isPostUploadProcessingInProgress()
    ) {
      log.debug(
        "auto-sync: an export/import/upload is already running, skipping",
      );
      return;
    }

    if (isTickBlockedByPreviousError(state.autoSync.status)) {
      log.debug(
        `auto-sync: last check ended in ${state.autoSync.status}, skipping until the user retries`,
      );
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
    if (!survey || !cycle || !isUploadAllowedForSurvey(survey)) {
      log.debug(
        "auto-sync: no survey or cycle selected, or uploads not allowed for the survey, skipping",
      );
      return;
    }

    const {
      openRecordIdleThresholdMs: configuredIdleThresholdMs,
      slowCheckIntervalMs,
    } = getAutoSyncIntervalsMs(state.settings);
    // an explicit "Sync now" shouldn't wait for the record open in the editor to become idle
    const openRecordIdleThresholdMs = ignoreOpenRecordIdleThreshold
      ? -1
      : configuredIdleThresholdMs;

    if (
      !prefetchedRecords &&
      isAlreadyUpToDate({ autoSyncState: state.autoSync, slowCheckIntervalMs })
    ) {
      log.debug(
        "auto-sync: already up to date, skipping check until the next slow check",
      );
      return;
    }

    tickInProgress = true;
    log.debug(
      `auto-sync: tick starting (survey=${survey.uuid}, cycle=${cycle})`,
    );
    try {
      let records = prefetchedRecords;
      if (!records) {
        dispatch(AutoSyncActions.checkStart());
        records = await RecordService.syncRecordSummaries({
          survey,
          cycle,
          onlyLocal: false,
        });
        log.debug(`auto-sync: fetched ${records.length} record summary(ies)`);
        dispatch(AutoSyncActions.checkEnd({ records, survey }));
      }

      const currentlyEditedRecordUuid =
        DataEntrySelectors.selectRecord(getState())?.uuid;

      const candidates = selectAutoSyncCandidates({
        records,
        survey,
        currentlyEditedRecordUuid,
        openRecordIdleThresholdMs,
      });
      if (candidates.length > 0) {
        await uploadAutoSyncCandidates({
          dispatch,
          getState,
          cycle,
          candidates,
        });
        return;
      }

      const fetchCandidates = selectAutoFetchCandidates({
        records,
        survey,
        autoSyncEnabled: !!getState().settings?.autoSyncEnabled,
        currentlyEditedRecordUuid,
      });
      if (fetchCandidates.length > 0) {
        await dispatch(
          fetchRecordsChangedRemotely({
            cycle,
            recordUuids: fetchCandidates.map((record) => record.uuid),
          }),
        );
      }

      // a tick does a single upload, and the conflict resolution strategy applies to all of it:
      // records to merge can't share it with the ones above (a merge, unlike an overwrite, doesn't
      // propagate nodes deleted in the device), so they're sent once nothing else is left to send
      const mergeCandidates = selectAutoMergeCandidates({
        records,
        survey,
        autoSyncEnabled: !!getState().settings?.autoSyncEnabled,
        currentlyEditedRecordUuid,
        openRecordIdleThresholdMs,
      });
      if (mergeCandidates.length > 0) {
        await uploadAutoMergeCandidates({
          dispatch,
          getState,
          cycle,
          candidates: mergeCandidates,
          currentlyEditedRecordUuid,
        });
        return;
      }

      log.debug(
        "auto-sync: no record is a safe upload candidate, nothing to do",
      );
      dispatch(
        AutoSyncActions.setStatusMessage(
          "dataEntry:autoSync.status.noCandidatesMessage",
        ),
      );
    } catch (error) {
      handleAutoSyncTickError({ dispatch, error });
    } finally {
      tickInProgress = false;
    }
  };

export { runAutoSync };
