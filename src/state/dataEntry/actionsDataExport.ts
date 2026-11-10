import { JobStatus, Objects } from "@openforis/arena-core";

import { RecordService, UserService } from "service";
import { RecordsExportFileGenerationJob } from "service/recordsExportFileGenerationJob";

import { i18n } from "localization";
import { JobCancelError, ValidationUtils } from "model";
import type { AppDispatch, RootState } from "state/store";
import { Files, log } from "utils";

import { AutoSyncActions } from "../autoSync";
import { ConfirmActions, ConfirmUtils, OnConfirmParams } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";
import { DataEntryActionsRecordSync } from "./actionsRecordSync";
import {
  errorTextLooksLikeAuthError,
  handleDataExportError,
  REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES,
} from "./dataExportUtils";
import { startUploadDataToRemoteServer } from "./actionsRecordsUpload";
import {
  fetchMergedRecordsAndNotify,
  fetchMergedSameRecordsSilently,
  getMergedSameRecordUuidsToFetch,
} from "./actionsMergedRecords";

const { t } = i18n;

const exportType = {
  remote: "remote",
  share: "share",
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
  async (dispatch: AppDispatch) => {
    try {
      if (selectedSingleChoiceValue === exportType.remote) {
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
      } else {
        await Files.shareFile({
          url: outputFileUri,
          mimeType: Files.MIME_TYPES.zip,
          dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
        });
      }
    } catch (error) {
      dispatch(handleDataExportError(error));
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
  const onConfirm = ({ selectedSingleChoiceValue }: OnConfirmParams) => {
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
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
    const surveyId = survey.id;
    let dateModifiedByUuid: Record<string, any> = {};

    const onUploadComplete = async (jobComplete: any) => {
      const { result } = jobComplete;
      const {
        mergedRecordsMap,
        mergedSameRecordUuids = [],
        skippedRecordsUuids = [],
      } = result;

      // records merged with their own server copy are left out: the local copy doesn't match the
      // server's until the merged version is fetched (below), which stamps the sync baseline itself.
      // Stamping it here, if that fetch then doesn't go through the record would look "modified
      // locally" only, and the next (plain overwrite) upload of its pre-merge content would delete
      // from the server what the other side added.
      // records skipped by the server are left out too: their edits have not reached it.
      const recordUuidsSynced = recordUuids.filter(
        (uuid: string) =>
          !mergedSameRecordUuids.includes(uuid) &&
          !skippedRecordsUuids.includes(uuid),
      );
      if (recordUuidsSynced.length > 0) {
        await RecordService.confirmRecordsSyncedWithRemote({
          survey,
          cycle,
          recordUuids: recordUuidsSynced,
          dateModifiedByUuid: Object.fromEntries(
            recordUuidsSynced.map((uuid: string) => [
              uuid,
              dateModifiedByUuid[uuid],
            ]),
          ),
        });
      }
      if (!Objects.isEmpty(mergedRecordsMap)) {
        // the local record(s) got merged into a different, already existing record on the
        // server (same key(s), different uuid). From the user's point of view it's still the
        // record they created, so the record they were merged into is fetched and takes their
        // place in the list: it carries this device's contribution, so it's tagged as "local"
        // (visible under "records in device") instead of "remote", otherwise it would only be
        // visible under "all records".
        const mergedIntoRecordUuids = [
          ...new Set(Object.values(mergedRecordsMap) as string[]),
        ];
        const mergedRecordsFetched = await fetchMergedRecordsAndNotify({
          dispatch,
          survey,
          lang,
          cycle,
          recordUuids: mergedIntoRecordUuids,
          mergeKeepLocalOriginRecordUuids: mergedIntoRecordUuids,
          silent,
        });
        if (mergedRecordsFetched) {
          // hide the local rows (merged_into_record_uuid set = excluded from the records list)
          // only now that their replacement is in the device: hiding them before, the user's
          // data would just seem to disappear whenever the fetch doesn't go through
          await RecordService.updateRecordsMergedInto({
            surveyId,
            mergedRecordsMap,
          });
        } else {
          log.warn(
            `exportRecords: merged record(s) ${mergedIntoRecordUuids.join(", ")} not fetched; keeping local record(s) visible`,
          );
        }
      }
      const mergedSameRecordUuidsToFetch = getMergedSameRecordUuidsToFetch({
        getState,
        mergedSameRecordUuids,
        silent,
      });
      if (silent && mergedSameRecordUuidsToFetch.length > 0) {
        await fetchMergedSameRecordsSilently({
          dispatch,
          getState,
          survey,
          lang,
          cycle,
          recordUuids: mergedSameRecordUuidsToFetch,
        });
      } else if (mergedSameRecordUuidsToFetch.length > 0) {
        // the server combined this device's edits with newer edits already on the server: refresh the
        // local copy so it reflects the merged content, not this device's pre-merge version. The record
        // uuid didn't change, so keep it tagged as "local" (still shows up under "records in device")
        // instead of flipping it to "remote" like a regular fetch of someone else's record would.
        await fetchMergedRecordsAndNotify({
          dispatch,
          survey,
          lang,
          cycle,
          recordUuids: mergedSameRecordUuidsToFetch,
          mergeKeepLocalOriginRecordUuids: mergedSameRecordUuidsToFetch,
        });
      }
      await onJobCompleteParam?.(jobComplete);
    };

    const onJobComplete = (jobComplete: any) =>
      DataEntryActionsRecordSync.runAsPostUploadProcessing(() =>
        onUploadComplete(jobComplete),
      );

    log.debug(
      `exportRecords: starting (recordUuids=${recordUuids?.length ?? 0}, onlyLocally=${onlyLocally}, onlyRemote=${onlyRemote}, silent=${silent})`,
    );
    try {
      const user = onlyLocally ? {} : await UserService.fetchUser();

      // read before generating the file: a later edit is seen as a local change and sent again
      dateModifiedByUuid =
        onlyLocally || !recordUuids
          ? {}
          : await RecordService.fetchRecordsDateModifiedByUuid({
              surveyId,
              recordUuids,
            });

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
        ...(onlyRemote
          ? REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES.zipGeneration
          : {}),
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
        log.warn(
          `exportRecords: zip preparation failed: ${JSON.stringify(error.errors)}`,
        );
        _onExportFileGenerationError({
          errors: error.errors,
          dispatch,
          silent,
        });
      } else {
        log.warn(`exportRecords: unexpected error: ${error}`);
        dispatch(handleDataExportError(error, silent));
      }
    }
    await onEnd?.();
  };
