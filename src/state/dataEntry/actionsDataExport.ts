import { JobStatus, Objects, Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { AuthService, RecordService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'service/recordsExportFileGener... Remove this comment to see the full error message
import { RecordsExportFileGenerationJob } from "service/recordsExportFileGenerationJob";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { i18n } from "localization";
import { ConfirmActions, ConfirmUtils } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";

import { SurveySelectors } from "../survey";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Files, Jobs } from "utils";
// @ts-expect-error TS(2307): Cannot find module 'model/utils/ValidationUtils' o... Remove this comment to see the full error message
import { ValidationUtils } from "model/utils/ValidationUtils";
// @ts-expect-error TS(2307): Cannot find module 'service/recordsUploadJob' or i... Remove this comment to see the full error message
import { RecordsUploadJob } from "service/recordsUploadJob";
// @ts-expect-error TS(2307): Cannot find module 'state/remoteConnection' or its... Remove this comment to see the full error message
import { RemoteConnectionSelectors } from "state/remoteConnection";

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

const handleError = (error: any) => (dispatch: any) => dispatch(
  MessageActions.setMessage({
    content: "dataEntry:dataExport.error",
    contentParams: { details: errorOrJobToString(error) },
  })
);

const startUploadDataToRemoteServer =
  ({
    outputFileUri,
    conflictResolutionStrategy,
    onJobComplete = null
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const cycle = Surveys.getDefaultCycleKey(survey);

    const uploadJob = new RecordsUploadJob({
      user,
      survey,
      cycle,
      fileUri: outputFileUri,
      conflictResolutionStrategy,
    });

    const startAndWaitForJob = async () =>
      JobMonitorActions.startAsync({
        dispatch,
        job: uploadJob,
        titleKey: "dataEntry:uploadingData.title",
      });

    try {
      let uploadComplete = false;
      let uploadJobComplete = null;

      while (!uploadComplete) {
        try {
          uploadJobComplete = await startAndWaitForJob();
          uploadComplete = !!uploadJobComplete;
        } catch (error) {
          if (!error) {
            // (error is null if job was canceled)
            // job canceled: break the loop
            uploadComplete = true;
          } else {
            // error occurred
            // @ts-expect-error TS(2339): Property 'errors' does not exist on type 'unknown'... Remove this comment to see the full error message
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
            uploadComplete = !retryConfirmed;
          }
        }
      }
      if (!uploadJobComplete) return;

      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const { remoteJob } = uploadJobComplete.result;

      dispatch(
        JobMonitorActions.start({
          jobUuid: remoteJob.uuid,
          titleKey: "dataEntry:dataExport.title",
          onJobComplete,
        })
      );
    } catch (error) {
      if (error) {
        dispatch(handleError(error));
      } else {
        // job canceled, do nothing
      }
    }
  };

const onExportConfirmed =
  ({
    selectedSingleChoiceValue,
    conflictResolutionStrategy,
    outputFileUri,
    onJobComplete
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

const _onExportFileGenerationError = ({
  errors,
  dispatch
}: any) => {
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
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
  dispatch
}: any) => {
  const { outputFileUri } = result || {};
  const availableExportTypes = [];
  if (!onlyLocally) {
    availableExportTypes.push(exportType.remote);
  }
  if (!onlyRemote && (await Files.isSharingAvailable())) {
    availableExportTypes.push(exportType.share);
  }
  const onConfirm = ({
    selectedSingleChoiceValue
  }: any) => {
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
    onEnd = null
  }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state);
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
