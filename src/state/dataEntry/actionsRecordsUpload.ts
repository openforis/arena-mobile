import { Surveys, UUIDs } from "@openforis/arena-core";

import { AppCompatibilityOperation, SettingsService } from "service";

import { JobCancelError } from "model";
import type { RecordsUploadState } from "service/RecordsUploadAndProcessJobContext";
import { RecordsUploadAndProcessJob } from "service/recordsUploadAndProcessJob";
import { RECORDS_UPLOAD_JOB_TYPE } from "service/recordsUploadJob";
import { REMOTE_JOB_WATCHER_JOB_TYPE } from "service/remoteJobWatcherJob";
import {
  AppCompatibilityActions,
  RemoteConnectionSelectors,
} from "state/remoteConnection";
import type { AppDispatch, AppGetState } from "state/store";
import { Jobs, log } from "utils";

import { AutoSyncActions } from "../autoSync";
import { ConfirmUtils } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { SurveySelectors } from "../survey";
import {
  errorOrJobToString,
  isAuthError,
  REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES,
} from "./dataExportUtils";
import { i18n } from "localization";

const { t } = i18n;

/**
 * Helper to handle a job error and prompt the user for a retry.
 * Returns true if the user confirms a retry, false otherwise.
 * */
const handleUploadJobError = async ({
  dispatch,
  error,
}: {
  error: any;
  dispatch: AppDispatch;
}): Promise<boolean> => {
  if (error instanceof JobCancelError) {
    // job canceled
    return false;
  }
  // error occurred
  const { errors } = error;
  const errorMessage = errors
    ? Jobs.extractErrorMessage({ errors, t })
    : String(error);

  // break the loop if user doesn't confirm to retry
  const retryConfirmed = await ConfirmUtils.confirm({
    dispatch,
    messageKey: "dataEntry:dataExport.error",
    messageParams: { details: errorMessage },
    confirmButtonTextKey: "common:tryAgain",
  });
  return !!retryConfirmed;
};

// which of RecordsUploadAndProcessJob's two inner jobs the given (rejected) job summary/error
// was current on - see JobBase's own `innerJobs`/`currentInnerJobIndex` (both part of
// toJSON(), which is what startAsync rejects with on failure). A JobCancelError (the user
// canceled either phase) never has these fields, so this correctly returns undefined for it too.
const getFailedInnerJobType = (error: any): string | undefined =>
  error?.innerJobs?.[error?.currentInnerJobIndex]?.type;

// static: doesn't depend on any per-call value, so it's built once instead of on every retry
// attempt - see JobMonitorActions.startAsync's innerJobUiConfigByType
const UPLOAD_AND_PROCESS_INNER_JOB_UI_CONFIG = {
  [RECORDS_UPLOAD_JOB_TYPE]: {
    titleKey: "dataEntry:uploadingData.title",
    showTransferStats: true,
  },
  [REMOTE_JOB_WATCHER_JOB_TYPE]: {
    titleKey: "dataEntry:processingData.title",
    showTransferStats: false,
  },
};

// decides what a failed upload+processing attempt should do next: false to stop (the failure
// is already fully handled, or isn't worth retrying), true to try again. Kept separate from
// startUploadDataToRemoteServer's own retry loop to keep that loop's own cognitive complexity
// down to something SonarQube is happy with.
const handleUploadAndProcessError = async ({
  dispatch,
  error,
  silent,
}: {
  dispatch: AppDispatch;
  error: any;
  silent: boolean;
}): Promise<boolean> => {
  if (silent) {
    // an unattended tick must never block on a retry confirmation; shown through the sync status
    // icon instead, which also stops further automatic ticks until the user retries - covers a
    // failure in either phase (upload or server-side processing)
    log.warn(
      `auto-sync: upload/processing failed: ${errorOrJobToString(error)}`,
    );
    dispatch(
      isAuthError(error)
        ? AutoSyncActions.authError()
        : AutoSyncActions.checkError(),
    );
    return false;
  }
  // only the upload phase is worth silently retrying (e.g. a network hiccup) - a processing
  // failure already happened server-side after a successful upload, so re-uploading the whole
  // file again wouldn't help; it's left to surface through the job monitor dialog's own failed
  // state instead, same as before this job existed
  if (getFailedInnerJobType(error) !== RECORDS_UPLOAD_JOB_TYPE) {
    return false;
  }
  return handleUploadJobError({ dispatch, error });
};

export const startUploadDataToRemoteServer =
  ({
    outputFileUri,
    conflictResolutionStrategy,
    skipMissingFiles = false,
    onJobComplete = null,
    silent = false,
    // true when the whole zip-generation -> upload+processing chain was known upfront (see
    // REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES) - so this phase can keep filling the same overall
    // progress bar the zip-generation phase already started, instead of resetting it back to 0%
    chained = false,
  }: any) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const cycle = Surveys.getDefaultCycleKey(survey);

    const appVersionSupported = await dispatch(
      AppCompatibilityActions.checkAppVersionSupported({
        operation: AppCompatibilityOperation.recordsUpload,
        silent,
      }),
    );
    if (!appVersionSupported) {
      if (silent) {
        // shown through the sync status icon, as the other unattended upload failures
        dispatch(AutoSyncActions.checkError());
      }
      return;
    }

    log.debug(
      `startUploadDataToRemoteServer: starting upload+processing of ${outputFileUri} (survey=${survey.uuid}, cycle=${cycle})`,
    );

    const { dataUploadChunkSizeKB } = await SettingsService.fetchSettings();
    const uploadState: RecordsUploadState = {
      fileId: UUIDs.v4(),
      chunkSize: dataUploadChunkSizeKB * 1024,
      nextChunk: 1,
    };
    // uploads the zip, then watches the server-side job it kicks off, as ONE job - see
    // RecordsUploadAndProcessJob for why (and why only these two, not zip-generation too)
    const createUploadAndProcessJob = () =>
      new RecordsUploadAndProcessJob({
        user,
        survey,
        cycle,
        fileUri: outputFileUri,
        conflictResolutionStrategy,
        skipMissingFiles,
        uploadState,
      });
    const progressRange = chained
      ? REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES.uploadAndProcess
      : {};

    // runs the job, starting it again while the user chooses to retry it
    const runUploadAndProcessJob = async (): Promise<any> => {
      let jobComplete: any = null;
      let shouldRetry: boolean;
      try {
        jobComplete = await JobMonitorActions.startAsync({
          dispatch,
          // a job that has ended can't be started again
          job: createUploadAndProcessJob(),
          // initial values, matching the upload phase (the first inner job to run) - see
          // innerJobUiConfigByType for how these switch once processing takes over
          titleKey: "dataEntry:uploadingData.title",
          showTransferStats: true,
          transferSizeTextKey: "dataEntry:uploadingData.size",
          transferSpeedTextKey: "dataEntry:uploadingData.speed",
          transferEtaTextKey: "dataEntry:uploadingData.eta",
          innerJobUiConfigByType: UPLOAD_AND_PROCESS_INNER_JOB_UI_CONFIG,
          onJobComplete,
          silent,
          ...progressRange,
        });
        shouldRetry = !jobComplete;
      } catch (error: any) {
        shouldRetry = await handleUploadAndProcessError({
          dispatch,
          error,
          silent,
        });
      }
      return shouldRetry ? runUploadAndProcessJob() : jobComplete;
    };

    const jobComplete = await runUploadAndProcessJob();
    if (!jobComplete) {
      log.debug(
        "startUploadDataToRemoteServer: upload/processing canceled or failed",
      );
    }
  };
