import {
  FlatDataExportDefaultOptions,
  FlatDataExportOption,
  FlatDataExportOptions,
  JobSerialized,
  JobStatus,
  Objects,
  Surveys,
} from "@openforis/arena-core";

import { RecordService, UserService } from "service";
import { RecordsExportFileGenerationJob } from "service/recordsExportFileGenerationJob";

import { i18n } from "localization";
import { JobCancelError, RecordUtils, ValidationUtils } from "model";
import {
  FlatDataExportJob,
  FlatDataExportJobResult,
} from "service/dataExportJob";
import { RecordsUploadAndProcessJob } from "service/recordsUploadAndProcessJob";
import { RECORDS_UPLOAD_JOB_TYPE } from "service/recordsUploadJob";
import { REMOTE_JOB_WATCHER_JOB_TYPE } from "service/remoteJobWatcherJob";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { RootState } from "state/store";
import { Files, Jobs, log } from "utils";

import { fetchRecordsFromServer } from "./actionsRecordsImport";
import { AutoSyncActions } from "../autoSync";
import { ConfirmActions, ConfirmUtils, OnConfirmParams } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";

const { t } = i18n;

const exportType = {
  remote: "remote",
  share: "share",
};

// zip preparation and upload+processing (see RecordsUploadAndProcessJob) are two separate
// job-monitor calls (see JobMonitorActions.startAsync calls below), each with its own 0-100%
// progress - without this, the bar would restart from 0% between them instead of climbing
// smoothly through one continuous operation (see JobMonitorState.progressRangeStart/End). Only
// applied when going straight to the remote server (onlyRemote): a plain "export" only knows
// whether it'll continue into an upload after the zip is ready and the user picks a target, so
// its zip-preparation phase can't be pre-allocated a slice of a chain that might not happen.
// Upload and server-side processing don't need their own synthetic split the way zip-generation
// does here: they're composed into one job (RecordsUploadAndProcessJob), so JobBase's own
// inner-job progress weighting already makes that half continuous natively.
const REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES = {
  zipGeneration: { progressRangeStart: 0, progressRangeEnd: 33 },
  uploadAndProcess: { progressRangeStart: 33, progressRangeEnd: 100 },
};

const errorOrJobToString = (errorOrJob: any) => {
  if (!errorOrJob) {
    return "";
  }
  if (errorOrJob instanceof Error) {
    return errorOrJob.message ?? errorOrJob.toString();
  }
  // job
  if (errorOrJob.status === JobStatus.failed) {
    return JSON.stringify(errorOrJob.errors);
  }
  return JSON.stringify(errorOrJob);
};

// a failed job's error has already been collapsed into a {key, params: {text}} shape by the
// time it gets here (see JobBase.getErrorInfo), losing the original HTTP status - fall back to
// sniffing it out of the stringified error text
const errorTextLooksLikeAuthError = (text: string) => /\bstatus code 401\b/.test(text);

// a raw axios error still has response.status
const isAuthError = (error: any) =>
  error?.response?.status === 401 ||
  error?.status === 401 ||
  errorTextLooksLikeAuthError(errorOrJobToString(error));

const handleError =
  (error: any, silent = false) =>
  (dispatch: any) => {
    if (silent) {
      // an unattended tick must never surface a blocking error dialog; shown through the sync
      // status icon instead, which also stops further automatic ticks until the user retries
      log.warn(`auto-sync: export/upload failed: ${errorOrJobToString(error)}`);
      dispatch(isAuthError(error) ? AutoSyncActions.authError() : AutoSyncActions.checkError());
      return;
    }
    dispatch(
      MessageActions.setMessage({
        content: "dataEntry:dataExport.error",
        contentParams: { details: errorOrJobToString(error) },
      }),
    );
  };

/**
 * Helper to handle a job error and prompt the user for a retry.
 * Returns true if the user confirms a retry, false otherwise.
 * */
const handleUploadJobError = async ({
  dispatch,
  error,
}: {
  error: any;
  dispatch: any;
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
  dispatch: any;
  error: any;
  silent: boolean;
}): Promise<boolean> => {
  if (silent) {
    // an unattended tick must never block on a retry confirmation; shown through the sync status
    // icon instead, which also stops further automatic ticks until the user retries - covers a
    // failure in either phase (upload or server-side processing)
    log.warn(`auto-sync: upload/processing failed: ${errorOrJobToString(error)}`);
    dispatch(isAuthError(error) ? AutoSyncActions.authError() : AutoSyncActions.checkError());
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

const startUploadDataToRemoteServer =
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
    async (dispatch: any, getState: any) => {
      const state = getState();
      const user = RemoteConnectionSelectors.selectLoggedUser(state);
      const survey = SurveySelectors.selectCurrentSurvey(state)!;
      const cycle = Surveys.getDefaultCycleKey(survey);

      log.debug(
        `startUploadDataToRemoteServer: starting upload+processing of ${outputFileUri} (survey=${survey.uuid}, cycle=${cycle})`,
      );

      // uploads the zip, then watches the server-side job it kicks off, as ONE job - see
      // RecordsUploadAndProcessJob for why (and why only these two, not zip-generation too)
      const uploadAndProcessJob = new RecordsUploadAndProcessJob({
        user,
        survey,
        cycle,
        fileUri: outputFileUri,
        conflictResolutionStrategy,
        skipMissingFiles,
      });
      const progressRange = chained ? REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES.uploadAndProcess : {};

      let shouldRetry = true;
      let jobComplete: any = null;

      while (shouldRetry) {
        try {
          jobComplete = await JobMonitorActions.startAsync({
            dispatch,
            job: uploadAndProcessJob,
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
          shouldRetry = await handleUploadAndProcessError({ dispatch, error, silent });
        }
      }
      if (!jobComplete) {
        log.debug("startUploadDataToRemoteServer: upload/processing canceled or failed");
      }
    };

const determineAvailableDataExportOptions = ({
  state,
}: {
  state: RootState;
}): FlatDataExportOption[] => {
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const result = [
    FlatDataExportOption.includeAncestorAttributes,
    FlatDataExportOption.includeCategoryItemsLabels,
    FlatDataExportOption.includeFiles,
    FlatDataExportOption.includeTaxonScientificName,
  ];
  if (Surveys.getCycleKeys(survey).length > 1) {
    result.push(FlatDataExportOption.addCycle);
  }
  return result;
};

const selectedOptionsToDataExportOptions = ({
  availableOptions,
  selectedOptions,
}: {
  availableOptions: FlatDataExportOption[];
  selectedOptions: string[] | undefined;
}) => {
  const options: FlatDataExportOptions = {};
  for (const option of availableOptions) {
    options[option] = selectedOptions?.includes(option) ?? false;
  }
  if (selectedOptions?.includes(FlatDataExportOption.includeFiles)) {
    options[FlatDataExportOption.includeFileAttributeDefs] = true;
  }
  return options;
};

export const startCsvDataExportJob =
  () => async (dispatch: any, getState: any) => {
    try {
      const state = getState();

      const availableDataExportOptions = determineAvailableDataExportOptions({
        state,
      });
      const multipleChoiceOptions = availableDataExportOptions.map(
        (option) => ({
          value: option,
          label: `dataEntry:dataExport.option.${option}`,
        }),
      );

      const onConfirm = async ({
        selectedMultipleChoiceValues,
      }: OnConfirmParams) => {
        log.debug(
          `starting CSV data export with options:`,
          selectedMultipleChoiceValues,
        );

        await dispatch(ConfirmActions.dismiss());

        const user = RemoteConnectionSelectors.selectLoggedUserSafe(state);
        const survey = SurveySelectors.selectCurrentSurvey(state)!;
        const cycle = SurveySelectors.selectCurrentSurveyCycle(state);

        const selectedDataExportOptions = {
          ...FlatDataExportDefaultOptions,
          ...selectedOptionsToDataExportOptions({
            availableOptions: availableDataExportOptions,
            selectedOptions: selectedMultipleChoiceValues,
          }),
        };

        log.debug("Initializing FlatDataExportJob");

        const dataExportJob = new FlatDataExportJob({
          type: "FlatDataExportJob",
          user,
          survey,
          surveyId: survey.id!,
          cycle,
          options: selectedDataExportOptions,
        });

        await JobMonitorActions.startAsync({
          autoDismiss: true,
          dispatch,
          job: dataExportJob,
          titleKey: "dataEntry:dataExport.exportingData",
          onJobComplete: (jobComplete: JobSerialized<FlatDataExportJobResult>) => {
            const { result } = jobComplete;
            const { outputFileUri } = result || {};
            if (outputFileUri) {
              Files.shareFile({
                url: outputFileUri,
                mimeType: Files.MIME_TYPES.zip,
                dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
              });
            }
          },
        });
      };
      dispatch(
        ConfirmActions.show({
          titleKey: "dataEntry:dataExport.confirm.title",
          messageKey: "dataEntry:dataExport.confirm.selectOptions",
          onConfirm,
          multipleChoiceOptions,
          confirmButtonTextKey: "common:export",
        }),
      );
    } catch (error) {
      dispatch(handleError(error));
    }
  };

const onExportConfirmed =
  ({
    selectedSingleChoiceValue,
    conflictResolutionStrategy,
    outputFileUri,
    skipMissingFiles = false,
    onJobComplete,
    silent = false,
    // see startUploadDataToRemoteServer's `chained` param
    chained = false,
  }: any) =>
    async (dispatch: any) => {
      try {
        switch (selectedSingleChoiceValue) {
          case exportType.remote:
            dispatch(
              startUploadDataToRemoteServer({
                outputFileUri,
                conflictResolutionStrategy,
                skipMissingFiles,
                onJobComplete,
                silent,
                chained,
              }),
            );
            break;
          default:
            await Files.shareFile({
              url: outputFileUri,
              mimeType: Files.MIME_TYPES.zip,
              dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
            });
        }
      } catch (error) {
        dispatch(handleError(error));
      }
    };

const _onExportFileGenerationError = ({
  errors,
  dispatch,
  silent = false,
}: any) => {
  const validationErrors = Object.values(errors).map((item: any) => item.error);
  const details = validationErrors
    .map((validationError) =>
      ValidationUtils.getJointErrorText({
        validation: validationError,
        t,
      }),
    )
    .join(";\n");
  if (silent) {
    // shown through the sync status icon instead, which also stops further automatic ticks
    // until the user retries
    log.warn(`auto-sync: error generating records export file: ${details}`);
    dispatch(
      errorTextLooksLikeAuthError(details)
        ? AutoSyncActions.authError()
        : AutoSyncActions.checkError(),
    );
    return;
  }
  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:errorGeneratingRecordsExportFile",
      contentParams: { details },
    }),
  );
};

const _onExportFileGenerationSucceeded = async ({
  result,
  onlyLocally,
  onlyRemote = false,
  conflictResolutionStrategy,
  onJobComplete,
  dispatch,
  silent = false,
}: any) => {
  const { outputFileUri, recordsWithMissingFiles = [] } = result || {};

  if (recordsWithMissingFiles.length > 0 && !silent) {
    const recordsList = recordsWithMissingFiles
      .map(({ keysText }: { keysText: string }) => `- ${keysText}`)
      .join("\n");

    const confirmed = await ConfirmUtils.confirm({
      dispatch,
      titleKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.title",
      messageKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.message",
      messageParams: { recordsList },
      messageIsMarkdown: true,
      confirmButtonTextKey:
        "dataEntry:dataExport.recordsWithMissingFilesConfirm.confirmButton",
    });

    if (!confirmed) return;
  }
  // when silent (auto-sync), never block on the missing-files confirmation above:
  // proceed straight to uploading what's available, same outcome as the user confirming it

  const skipMissingFiles = recordsWithMissingFiles.length > 0;

  const availableExportTypes = [];
  if (!onlyLocally) {
    availableExportTypes.push(exportType.remote);
  }
  if (!onlyRemote && (await Files.isSharingAvailable())) {
    availableExportTypes.push(exportType.share);
  }
  const onConfirm = async ({ selectedSingleChoiceValue }: OnConfirmParams) => {
    dispatch(
      onExportConfirmed({
        selectedSingleChoiceValue,
        conflictResolutionStrategy,
        outputFileUri,
        skipMissingFiles,
        onJobComplete,
        silent,
        // onlyRemote means "remote" was the only option offered above, so the zip-generation
        // phase already reserved this chain a slice of the overall progress - see
        // REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES
        chained: onlyRemote,
      }),
    );
  };
  if (availableExportTypes.length === 1) {
    onConfirm({ selectedSingleChoiceValue: availableExportTypes[0] });
  } else {
    dispatch(
      ConfirmActions.show({
        titleKey: "dataEntry:dataExport.selectTarget",
        messageKey: "dataEntry:dataExport.selectTargetMessage",
        onConfirm,
        singleChoiceOptions: availableExportTypes.map((type) => ({
          value: type,
          label: `dataEntry:dataExport.target.${type}`,
        })),
        defaultSingleChoiceValue: availableExportTypes[0],
        confirmButtonTextKey: "common:export",
      }),
    );
  }
};

const showMergedRecordsMessage = async ({
  dispatch,
  survey,
  lang,
  cycle,
  recordUuids,
}: any) => {
  const recordsSummary = await RecordService.fetchRecords({
    survey,
    cycle,
    onlyLocal: false,
  });
  const recordsList = recordsSummary
    .filter((recordSummary: any) => recordUuids.includes(recordSummary.uuid))
    .map((recordSummary: any) => {
      const keyValuesByName = RecordUtils.getRecordSummaryValuesByKeyFormatted(
        { survey, lang, recordSummary, t },
      );
      const keysText =
        Object.values(keyValuesByName).join(" - ") || recordSummary.uuid;
      return `- ${keysText}`;
    })
    .join("\n");

  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:dataExport.recordsMergedMessage",
      contentParams: { recordsList },
    }),
  );
};

// re-downloads the given records (their content on the server is now the merged version,
// whether merged with newer edits on the same uuid or merged into a pre-existing uuid with the
// same key(s)) so the local copy reflects it, then lets the user know which records were merged.
// Awaited by the caller so the fetch (nodes + files) has actually finished, and the local copy is
// marked as fully downloaded, before anything reloads the records list.
const fetchMergedRecordsAndNotify = async ({
  dispatch,
  survey,
  lang,
  cycle,
  recordUuids,
  mergeKeepLocalOriginRecordUuids,
}: any) => {
  await dispatch(
    fetchRecordsFromServer({
      recordUuids,
      mergeKeepLocalOriginRecordUuids,
      onImportComplete: () =>
        showMergedRecordsMessage({ dispatch, survey, lang, cycle, recordUuids }),
    }),
  );
};

export const exportRecords =
  ({
    cycle,
    recordUuids,
    conflictResolutionStrategy = "overwriteIfUpdated",
    onlyLocally = false,
    onlyRemote = false,
    onJobComplete: onJobCompleteParam = null,
    onEnd = null,
    silent = false,
  }: any) =>
    async (dispatch: any, getState: any) => {
      const state = getState();
      const survey = SurveySelectors.selectCurrentSurvey(state)!;
      const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
      const surveyId = survey.id;

      const onJobComplete = async (jobComplete: any) => {
        const { result } = jobComplete;
        const { mergedRecordsMap, mergedSameRecordUuids } = result;

        await RecordService.confirmRecordsSyncedWithRemote({
          survey,
          cycle,
          recordUuids,
        });
        if (!Objects.isEmpty(mergedRecordsMap)) {
          await RecordService.updateRecordsMergedInto({
            surveyId,
            mergedRecordsMap,
          });

          // the local record(s) got merged into a different, already existing record on the
          // server (same key(s), different uuid). The local rows are now excluded from the
          // records list (merged_into_record_uuid is set), so without fetching the record they
          // were merged into, the user's data would just seem to disappear: fetch it so it shows
          // up in its place, then let the user know what happened. It carries this device's
          // contribution, so keep it tagged as "local" (visible under "records in device")
          // instead of "remote", otherwise it would only be visible under "all records".
          const mergedIntoRecordUuids = [
            ...new Set(Object.values(mergedRecordsMap) as string[]),
          ];
          await fetchMergedRecordsAndNotify({
            dispatch,
            survey,
            lang,
            cycle,
            recordUuids: mergedIntoRecordUuids,
            mergeKeepLocalOriginRecordUuids: mergedIntoRecordUuids,
          });
        }
        if (mergedSameRecordUuids?.length > 0) {
          // the server combined this device's edits with newer edits already on the server: refresh the
          // local copy so it reflects the merged content, not this device's pre-merge version. The record
          // uuid didn't change, so keep it tagged as "local" (still shows up under "records in device")
          // instead of flipping it to "remote" like a regular fetch of someone else's record would.
          await fetchMergedRecordsAndNotify({
            dispatch,
            survey,
            lang,
            cycle,
            recordUuids: mergedSameRecordUuids,
            mergeKeepLocalOriginRecordUuids: mergedSameRecordUuids,
          });
        }
        await onJobCompleteParam?.(jobComplete);
      };

      log.debug(
        `exportRecords: starting (recordUuids=${recordUuids?.length ?? 0}, onlyLocally=${onlyLocally}, onlyRemote=${onlyRemote}, silent=${silent})`,
      );
      try {
        const user = onlyLocally ? {} : await UserService.fetchUser();

        const job = new RecordsExportFileGenerationJob({
          survey,
          cycle,
          recordUuids,
          user,
          onlyRemote,
        });

        // wired through the job monitor (rather than a plain job.start()) so the zip
        // preparation phase is observable and cancelable, same as the upload phase below
        // a job is always passed in, so this always resolves with a real result (or rejects)
        const jobComplete = (await JobMonitorActions.startAsync({
          dispatch,
          job,
          titleKey: "dataEntry:dataExport.exportingData",
          autoDismiss: true,
          silent,
          ...(onlyRemote ? REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES.zipGeneration : {}),
        }))!;

        log.debug(
          `exportRecords: zip preparation succeeded, outputFileUri=${jobComplete.result?.outputFileUri}`,
        );

        await _onExportFileGenerationSucceeded({
          result: jobComplete.result,
          onlyLocally,
          onlyRemote,
          conflictResolutionStrategy,
          onJobComplete,
          dispatch,
          silent,
        });
      } catch (error: any) {
        if (error instanceof JobCancelError) {
          // canceled by the user while preparing the export: nothing more to do
          log.debug("exportRecords: zip preparation canceled by the user");
        } else if (error?.status === JobStatus.failed) {
          log.warn(`exportRecords: zip preparation failed: ${JSON.stringify(error.errors)}`);
          _onExportFileGenerationError({ errors: error.errors, dispatch, silent });
        } else {
          log.warn(`exportRecords: unexpected error: ${error}`);
          dispatch(handleError(error, silent));
        }
      }
      await onEnd?.();
    };
