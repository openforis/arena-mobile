import {
  DataExportDefaultOptions,
  DataExportOption,
  DataExportOptions,
  JobStatus,
  JobSummary,
  Objects,
  Surveys,
} from "@openforis/arena-core";

import { AuthService, RecordService } from "service";
import { RecordsExportFileGenerationJob } from "service/recordsExportFileGenerationJob";

import { i18n } from "localization";
import { JobCancelError, ValidationUtils } from "model";
import {
  FlatDataExportJob,
  FlatDataExportJobResult,
} from "service/dataExportJob";
import { RecordsUploadJob } from "service/recordsUploadJob";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import { RootState } from "state/store";
import { Files, Jobs, log } from "utils";

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
    })
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
  ({ outputFileUri, conflictResolutionStrategy, onJobComplete = null }: any) =>
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
    });

    let shouldRetryUpload = true;
    let uploadJobComplete = null;

    while (shouldRetryUpload) {
      try {
        uploadJobComplete = await JobMonitorActions.startAsync({
          dispatch,
          job: uploadJob,
          titleKey: "dataEntry:uploadingData.title",
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
        titleKey: "dataEntry:dataExport.title",
        onJobComplete,
      })
    );
  };

const determineAvailableDataExportOptions = ({
  state,
}: {
  state: RootState;
}): DataExportOption[] => {
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const result = [
    DataExportOption.includeAncestorAttributes,
    DataExportOption.includeCategoryItemsLabels,
    DataExportOption.includeFileAttributeDefs,
    DataExportOption.includeTaxonScientificName,
  ];
  if (Surveys.getCycleKeys(survey).length > 1) {
    result.push(DataExportOption.addCycle);
  }
  return result;
};

const selectedOptionsToDataExportOptions = ({
  availableOptions,
  selectedOptions,
}: {
  availableOptions: DataExportOption[];
  selectedOptions: string[] | undefined;
}) => {
  const options: DataExportOptions = {};
  availableOptions.forEach((option) => {
    options[option] = selectedOptions?.includes(option) ?? false;
  });
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
        })
      );

      const onConfirm = async ({
        selectedMultipleChoiceValues,
      }: OnConfirmParams) => {
        log.debug(
          `starting CSV data export with options:`,
          selectedMultipleChoiceValues
        );

        await dispatch(ConfirmActions.dismiss());

        const user = RemoteConnectionSelectors.selectLoggedUser(state);
        const survey = SurveySelectors.selectCurrentSurvey(state)!;
        const cycle = SurveySelectors.selectCurrentSurveyCycle(state);

        const selectedDataExportOptions = {
          ...DataExportDefaultOptions,
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
          onJobComplete: (jobComplete: JobSummary<FlatDataExportJobResult>) => {
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
        })
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
              onJobComplete,
            })
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
      })
    )
    .join(";\n");
  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:errorGeneratingRecordsExportFile",
      contentParams: { details },
    })
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
  const { outputFileUri } = result || {};
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
        onJobComplete,
      })
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
      })
    );
  }
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
    const surveyId = survey.id;

    const onJobComplete = async (jobComplete: any) => {
      const { result } = jobComplete;
      const { mergedRecordsMap } = result;

      await RecordService.updateRecordsDateSync({
        surveyId,
        recordUuids,
      });
      if (!Objects.isEmpty(mergedRecordsMap)) {
        await RecordService.updateRecordsMergedInto({
          surveyId,
          mergedRecordsMap,
        });
      }
      await onJobCompleteParam?.(jobComplete);
    };

    try {
      const user = onlyLocally ? {} : await AuthService.fetchUser();

      const job = new RecordsExportFileGenerationJob({
        survey,
        cycle,
        recordUuids,
        user,
      });
      await job.start();
      const { summary } = job;
      const { errors, result, status } = summary;

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
          })
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }
    await onEnd?.();
  };
