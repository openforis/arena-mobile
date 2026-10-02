import { JobStatus, Surveys } from "@openforis/arena-core";

import { RecordService } from "service/recordService";
import { RecordsAndFilesImportJob } from "service/recordsAndFilesImportJob";
import { JobMonitorActions } from "../jobMonitor/actions";
import { MessageActions } from "../message";
import { RemoteConnectionSelectors } from "../remoteConnection/selectors";
import { SurveySelectors } from "../survey/selectors";
import { ToastActions } from "../toast";
import { JobCancelError } from "model/JobCancelError";
import { log } from "utils";

import { AutoSyncActions } from "../autoSync/actions";

const handleImportErrors = ({
  dispatch,
  error = null,
  errors = null,
  silent = false,
}: any) => {
  const details = error?.toString() ?? JSON.stringify(errors);
  if (silent) {
    // an unattended fetch (see exportRecords: auto-sync replacing a record with its merged
    // version) must never surface a toast; shown through the sync status icon instead, which also
    // stops further automatic ticks until the user retries
    log.warn(`auto-sync: records fetch/import failed: ${details}`);
    dispatch(AutoSyncActions.checkError());
    return;
  }
  dispatch(ToastActions.show("recordsList:importFailed", { details }));
};

export const importRecordsFromFile =
  ({
    fileUri,
    onImportComplete,
    overwriteExistingRecords = true,
    mergeKeepLocalOriginRecordUuids,
    // true when not started by the user (see fetchRecordsFromServer): no dialog nor message
    silent = false,
  }: any) =>
    async (dispatch: any, getState: any) => {
      const state = getState();
      const user = RemoteConnectionSelectors.selectLoggedUserSafe(state);
      const survey = SurveySelectors.selectCurrentSurvey(state);

      const importJob = new RecordsAndFilesImportJob({
        survey,
        user,
        fileUri,
        overwriteExistingRecords,
        mergeKeepLocalOriginRecordUuids,
      });

      try {
        if (silent) {
          // run through the job monitor (silently: no dialog) only to keep it "busy" until the
          // records are stored, same as the upload that led here - see runAutoSync's own guard
          // and useRecordsList's refresh at the end of a silent job; rejects if not successful
          await JobMonitorActions.startAsync({
            dispatch,
            job: importJob,
            titleKey: "recordsList:fetchRecords.title",
            silent,
          });
          await onImportComplete?.();
          return;
        }
        await importJob.start();

        const { status, errors, result } = importJob;

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
            }),
          );
          await onImportComplete();
        } else {
          handleImportErrors({ dispatch, errors });
        }
      } catch (error: any) {
        if (silent && error instanceof JobCancelError) {
          // canceled by the user, do nothing
        } else if (silent && error?.errors) {
          // failed job (see JobMonitorActions.startAsync)
          handleImportErrors({ dispatch, errors: error.errors, silent });
        } else {
          handleImportErrors({ dispatch, error, silent });
        }
      }
    };

const _onExportFromServerJobComplete = async ({
  dispatch,
  state,
  job,
  onImportComplete,
  mergeKeepLocalOriginRecordUuids,
  silent,
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

    await dispatch(
      importRecordsFromFile({
        fileUri,
        onImportComplete,
        mergeKeepLocalOriginRecordUuids,
        silent,
      }),
    );
  } catch (error) {
    handleImportErrors({ dispatch, error, silent });
  }
};

const checkCanImportRecords = ({ dispatch, survey, silent = false }: any) => {
  let errorKey;
  if (!Surveys.isVisibleInMobile(survey)) {
    errorKey = "recordsList:fetchRecords.error.surveyNotVisibleInMobile";
  } else if (!Surveys.isRecordsDownloadInMobileAllowed(survey)) {
    errorKey = "recordsList:fetchRecords.error.recordsDownloadNotAllowed";
  }
  if (errorKey) {
    if (silent) {
      log.warn(`auto-sync: records cannot be fetched (${errorKey})`);
    } else {
      dispatch(ToastActions.show(errorKey));
    }
    return false;
  }
  return true;
};

export const fetchRecordsFromServer =
  ({
    recordUuids,
    onImportComplete,
    mergeKeepLocalOriginRecordUuids,
    // true when not started by the user (auto-sync replacing a record with its merged version):
    // nothing is shown, neither while fetching nor at the end
    silent = false,
  }: any) =>
    async (dispatch: any, getState: any) => {
      try {
        const state = getState();
        const survey = SurveySelectors.selectCurrentSurvey(state);
        const cycle = SurveySelectors.selectCurrentSurveyCycle(state);

        if (!checkCanImportRecords({ dispatch, survey, silent })) return;

        const job = await RecordService.startExportRecordsFromRemoteServer({
          survey,
          cycle,
          recordUuids,
        });
        const jobComplete = await JobMonitorActions.startAsync({
          dispatch,
          jobUuid: job.uuid,
          titleKey: "recordsList:fetchRecords.title",
          silent,
        });
        await _onExportFromServerJobComplete({
          dispatch,
          state,
          job: jobComplete,
          onImportComplete,
          mergeKeepLocalOriginRecordUuids,
          silent,
        });
      } catch (error) {
        if (error instanceof JobCancelError) {
          // job canceled, do nothing
        } else {
          handleImportErrors({ dispatch, error, silent });
        }
      }
    };
