import { JobStatus, Surveys } from "@openforis/arena-core";

import { RecordService } from "service/recordService";
import { RecordsAndFilesImportJob } from "service/recordsAndFilesImportJob";
import { JobMonitorActions } from "../jobMonitor/actions";
import { MessageActions } from "../message";
import { RemoteConnectionSelectors } from "../remoteConnection/selectors";
import { SurveySelectors } from "../survey/selectors";
import { ToastActions } from "../toast";
import { JobCancelError } from "model/JobCancelError";

const handleImportErrors = ({ dispatch, error = null, errors = null }: any) => {
  const details = error?.toString() ?? JSON.stringify(errors);
  dispatch(ToastActions.show("recordsList:importFailed", { details }));
};

export const importRecordsFromFile =
  ({ fileUri, onImportComplete, overwriteExistingRecords = true }: any) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const user = RemoteConnectionSelectors.selectLoggedUser(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);

    const importJob = new RecordsAndFilesImportJob({
      survey,
      user,
      fileUri,
      overwriteExistingRecords,
    });

    try {
      await importJob.start();

      const { status, errors, result } = importJob.summary;

      if (status === JobStatus.succeeded) {
        const { processedRecords, insertedRecords, updatedRecords } = result;
        dispatch(
          MessageActions.setMessage({
            content: "recordsList:importCompleteSuccessfully",
            contentParams: {
              processedRecords,
              insertedRecords,
              updatedRecords,
            },
          })
        );
        await onImportComplete();
      } else {
        handleImportErrors({ dispatch, errors });
      }
    } catch (error) {
      handleImportErrors({ dispatch, error });
    }
  };

const _onExportFromServerJobComplete = async ({
  dispatch,
  state,
  job,
  onImportComplete,
}: any) => {
  try {
    const { outputFileName: fileName } = job.result;

    const survey = SurveySelectors.selectCurrentSurvey(state);

    dispatch(JobMonitorActions.close());

    const fileUri =
      await RecordService.downloadExportedRecordsFileFromRemoteServer({
        survey,
        fileName,
      });

    dispatch(importRecordsFromFile({ fileUri, onImportComplete }));
  } catch (error) {
    handleImportErrors({ dispatch, error });
  }
};

const checkCanImportRecords = ({ dispatch, survey }: any) => {
  let errorKey;
  if (!Surveys.isVisibleInMobile(survey)) {
    errorKey = "recordsList:importRecords.error.surveyNotVisibleInMobile";
  } else if (!Surveys.isRecordsDownloadInMobileAllowed(survey)) {
    errorKey = "recordsList:importRecords.error.recordsDownloadNotAllowed";
  }
  if (errorKey) {
    dispatch(ToastActions.show(errorKey));
    return false;
  }
  return true;
};

export const importRecordsFromServer =
  ({ recordUuids, onImportComplete }: any) =>
  async (dispatch: any, getState: any) => {
    try {
      const state = getState();
      const survey = SurveySelectors.selectCurrentSurvey(state);
      const cycle = SurveySelectors.selectCurrentSurveyCycle(state);

      if (!checkCanImportRecords({ dispatch, survey })) return;

      const job = await RecordService.startExportRecordsFromRemoteServer({
        survey,
        cycle,
        recordUuids,
      });
      const jobComplete = await JobMonitorActions.startAsync({
        dispatch,
        jobUuid: job.uuid,
        titleKey: "recordsList:importRecords.title",
      });
      await _onExportFromServerJobComplete({
        dispatch,
        state,
        job: jobComplete,
        onImportComplete,
      });
    } catch (error) {
      if (error instanceof JobCancelError) {
        // job canceled, do nothing
      } else {
        handleImportErrors({ dispatch, error });
      }
    }
  };
