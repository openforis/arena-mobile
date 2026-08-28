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
import { RecordsUploadJob } from "service/recordsUploadJob";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { RootState } from "state/store";
import { Files, Jobs, log } from "utils";

import { fetchRecordsFromServer } from "./actionsRecordsImport";
import { ConfirmActions, ConfirmUtils, OnConfirmParams } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";

const { t } = i18n;

const exportType = {
  remote: "remote",
  share: "share",
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

const handleError = (error: any) => (dispatch: any) =>
  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:dataExport.error",
      contentParams: { details: errorOrJobToString(error) },
    }),
  );

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

const startUploadDataToRemoteServer =
  ({ outputFileUri, conflictResolutionStrategy, skipMissingFiles = false, onJobComplete = null }: any) =>
    async (dispatch: any, getState: any) => {
      const state = getState();
      const user = RemoteConnectionSelectors.selectLoggedUser(state);
      const survey = SurveySelectors.selectCurrentSurvey(state)!;
      const cycle = Surveys.getDefaultCycleKey(survey);

      const uploadJob = new RecordsUploadJob({
        user,
        survey,
        cycle,
        fileUri: outputFileUri,
        conflictResolutionStrategy,
        skipMissingFiles,
      });

      let shouldRetryUpload = true;
      let uploadJobComplete = null;

      while (shouldRetryUpload) {
        try {
          uploadJobComplete = await JobMonitorActions.startAsync({
            dispatch,
            job: uploadJob,
            titleKey: "dataEntry:uploadingData.title",
            showTransferStats: true,
            transferSizeTextKey: "dataEntry:uploadingData.size",
            transferSpeedTextKey: "dataEntry:uploadingData.speed",
            transferEtaTextKey: "dataEntry:uploadingData.eta",
          });
          shouldRetryUpload = !uploadJobComplete;
        } catch (error: any) {
          shouldRetryUpload = await handleUploadJobError({ dispatch, error });
        }
      }
      if (!uploadJobComplete) return;

      const { remoteJob } = uploadJobComplete.result;

      dispatch(
        JobMonitorActions.start({
          jobUuid: remoteJob.uuid,
          titleKey: "dataEntry:processingData.title",
          onJobComplete,
        }),
      );
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

const _onExportFileGenerationError = ({ errors, dispatch }: any) => {
  const validationErrors = Object.values(errors).map((item: any) => item.error);
  const details = validationErrors
    .map((validationError) =>
      ValidationUtils.getJointErrorText({
        validation: validationError,
        t,
      }),
    )
    .join(";\n");
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
}: any) => {
  const { outputFileUri, recordsWithMissingFiles = [] } = result || {};

  if (recordsWithMissingFiles.length > 0) {
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
// same key(s)) so the local copy reflects it, then lets the user know which records were merged
const fetchMergedRecordsAndNotify = ({
  dispatch,
  survey,
  lang,
  cycle,
  recordUuids,
}: any) => {
  dispatch(
    fetchRecordsFromServer({
      recordUuids,
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
          // up in its place, then let the user know what happened.
          const mergedIntoRecordUuids = [
            ...new Set(Object.values(mergedRecordsMap) as string[]),
          ];
          fetchMergedRecordsAndNotify({
            dispatch,
            survey,
            lang,
            cycle,
            recordUuids: mergedIntoRecordUuids,
          });
        }
        if (mergedSameRecordUuids?.length > 0) {
          // the server combined this device's edits with newer edits already on the server: refresh the
          // local copy so it reflects the merged content, not this device's pre-merge version
          fetchMergedRecordsAndNotify({
            dispatch,
            survey,
            lang,
            cycle,
            recordUuids: mergedSameRecordUuids,
          });
        }
        await onJobCompleteParam?.(jobComplete);
      };

      try {
        const user = onlyLocally ? {} : await UserService.fetchUser();

        const job = new RecordsExportFileGenerationJob({
          survey,
          cycle,
          recordUuids,
          user,
        });
        await job.start();
        const { errors, result, status } = job;

        if (status === JobStatus.failed) {
          _onExportFileGenerationError({ errors, dispatch });
        } else if (status === JobStatus.succeeded) {
          await _onExportFileGenerationSucceeded({
            result,
            onlyLocally,
            onlyRemote,
            conflictResolutionStrategy,
            onJobComplete,
            dispatch,
          });
        } else {
          dispatch(
            MessageActions.setMessage({
              content: `Job status: ${status}`,
            }),
          );
        }
      } catch (error) {
        dispatch(handleError(error));
      }
      await onEnd?.();
    };
