import { JobStatus, Objects, Surveys } from "@openforis/arena-core";

import { AuthService, RecordService } from "service";
import { RecordsExportFileGenerationJob } from "service/recordsExportFileGenerationJob";

import { i18n } from "localization";
import { ConfirmActions } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";

import { SurveySelectors } from "../survey";
import { Files } from "utils";
import { ValidationUtils } from "model/utils/ValidationUtils";

const { t } = i18n;

const exportType = {
  remote: "remote",
  local: "local",
  share: "share",
};

const handleError = (error) => (dispatch) =>
  dispatch(
    MessageActions.setMessage({
      content: "dataEntry:dataExport.error",
      contentParams: { details: error.toString() },
    })
  );

const startUploadDataToRemoteServer =
  ({ outputFileUri, conflictResolutionStrategy, onJobComplete = null }) =>
  async (dispatch, getState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const cycle = Surveys.getDefaultCycleKey(survey);

    try {
      const remoteJob = await RecordService.uploadRecordsToRemoteServer({
        survey,
        cycle,
        fileUri: outputFileUri,
        conflictResolutionStrategy,
      });

      dispatch(
        JobMonitorActions.start({
          jobUuid: remoteJob.uuid,
          titleKey: "dataEntry:exportData.title",
          onJobComplete,
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
  }) =>
  async (dispatch) => {
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
        case exportType.local: {
          const res = await Files.moveFileToDownloadFolder(outputFileUri);
          if (!res) {
            throw new Error("Permission denied");
          }
          break;
        }
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

const _onExportFileGenerationError = ({ errors, dispatch }) => {
  const validationErrors = Object.values(errors).map((item) => item.error);
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
}) => {
  const { outputFileUri } = result || {};
  const availableExportTypes = [];
  if (!onlyLocally) {
    availableExportTypes.push(exportType.remote);
  }
  if (!onlyRemote && (await Files.isSharingAvailable())) {
    availableExportTypes.push(exportType.share);
  }
  const onConfirm = ({ selectedSingleChoiceValue }) => {
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
  }) =>
  async (dispatch, getState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const surveyId = survey.id;

    const onJobComplete = async (jobComplete) => {
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
  };
