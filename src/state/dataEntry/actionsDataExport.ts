import {
  ArenaJobSerialized,
  JobStatus,
  NodeDefs,
  NodeDefType,
  Objects,
  ArenaValidation,
} from "@openforis/arena-core";

import { RecordService, UserService } from "service";
import {
  RecordsExportFileGenerationJob,
  RecordsExportFileGenerationJobResult,
} from "service/jobs/RecordsExportFileGenerationJob";
import type { RecordsUploadResult } from "service/jobs/recordsUpload";
import { RecordRemoteService } from "service/record/recordRemoteService";

import { i18n } from "localization";
import { JobCancelError, ValidationUtils } from "model";
import type { AppDispatch, AppGetState } from "state/store";
import { Files, log } from "utils";

import { AutoSyncActions } from "../autoSync";
import { ConfirmActions, ConfirmUtils, OnConfirmParams } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { MessageActions } from "../message";
import { SurveySelectors } from "../survey";
import type { CurrentSurvey } from "../survey/state";
import { DataEntryActionsRecordSync } from "./actionsRecordSync";
import {
  errorTextLooksLikeAuthError,
  getRemoteUploadChainProgressRanges,
  handleDataExportError,
  ProgressRange,
} from "./dataExportUtils";
import { startUploadDataToRemoteServer } from "./actionsRecordsUpload";
import {
  fetchMergedRecordsAndNotify,
  fetchMergedSameRecordsSilently,
  getMergedSameRecordUuidsToFetch,
} from "./actionsMergedRecords";
import { splitRecordUuidsInBatches } from "./recordsUploadBatches";

const { t } = i18n;

const exportType = {
  remote: "remote",
  share: "share",
};

type UploadJobSummary = ArenaJobSerialized<RecordsUploadResult | undefined>;

type OnUploadJobComplete = (
  jobComplete: UploadJobSummary,
) => void | Promise<void>;

// errors of the export file generation job, by record
type ExportFileGenerationErrors = Record<string, { error: ArenaValidation }>;

// see startUploadDataToRemoteServer: where the upload phase fits in the overall progress, and the message to show
type UploadMonitorOptions = {
  progressRange?: ProgressRange;
  messageKey?: string;
  messageParams?: Record<string, unknown>;
};

// resolves with the upload job summary once the upload ends (null if not uploaded)
const onExportConfirmed =
  ({
    selectedSingleChoiceValue,
    conflictResolutionStrategy,
    outputFileUri,
    skipMissingFiles = false,
    onJobComplete,
    silent = false,
    uploadMonitorOptions = {},
  }: {
    selectedSingleChoiceValue?: string | null;
    conflictResolutionStrategy?: string;
    outputFileUri: string;
    skipMissingFiles?: boolean;
    onJobComplete?: OnUploadJobComplete;
    silent?: boolean;
    uploadMonitorOptions?: UploadMonitorOptions;
  }) =>
  async (dispatch: AppDispatch): Promise<UploadJobSummary | null> => {
    try {
      if (selectedSingleChoiceValue === exportType.remote) {
        return await dispatch(
          startUploadDataToRemoteServer({
            outputFileUri,
            conflictResolutionStrategy,
            skipMissingFiles,
            onJobComplete,
            silent,
            ...uploadMonitorOptions,
          }),
        );
      }
      await Files.shareFile({
        url: outputFileUri,
        mimeType: Files.MIME_TYPES.zip,
        dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
      });
    } catch (error) {
      dispatch(handleDataExportError(error));
    }
    return null;
  };

const _onExportFileGenerationError = ({
  errors,
  dispatch,
  silent = false,
}: {
  errors: ExportFileGenerationErrors;
  dispatch: AppDispatch;
  silent?: boolean;
}) => {
  const validationErrors = Object.values(errors).map((item) => item.error);
  const details = validationErrors
    .map((validationError) =>
      ValidationUtils.getJointErrorText({
        validation: validationError,
        t: (key, params) => t(key, { ...params }),
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

const deleteExportFile = async (fileUri: string) => {
  try {
    await Files.del(fileUri, true);
  } catch (error) {
    log.warn(`exportRecords: error deleting ${fileUri}: ${error}`);
  }
};

// shared by the batches of an upload split in batches
type BatchesState = { missingFilesConfirmed: boolean };

const confirmRecordsWithMissingFiles = async ({
  recordsWithMissingFiles,
  dispatch,
}: {
  recordsWithMissingFiles: RecordsExportFileGenerationJobResult["recordsWithMissingFiles"];
  dispatch: AppDispatch;
}): Promise<boolean> => {
  const recordsList = recordsWithMissingFiles
    .map(({ keysText }) => `- ${keysText}`)
    .join("\n");

  const confirmResult = await ConfirmUtils.confirm({
    dispatch,
    titleKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.title",
    messageKey: "dataEntry:dataExport.recordsWithMissingFilesConfirm.message",
    messageParams: { recordsList },
    messageIsMarkdown: true,
    confirmButtonTextKey:
      "dataEntry:dataExport.recordsWithMissingFilesConfirm.confirmButton",
  });
  return !!confirmResult;
};

// when silent (auto-sync), never block on the missing-files confirmation:
// proceed straight to uploading what's available, same outcome as the user confirming it
const confirmMissingFilesIfNeeded = async ({
  recordsWithMissingFiles,
  dispatch,
  silent,
  batchesState,
}: {
  recordsWithMissingFiles: RecordsExportFileGenerationJobResult["recordsWithMissingFiles"];
  dispatch: AppDispatch;
  silent: boolean;
  batchesState?: BatchesState;
}): Promise<boolean> => {
  if (
    recordsWithMissingFiles.length === 0 ||
    silent ||
    batchesState?.missingFilesConfirmed
  ) {
    return true;
  }
  const confirmed = await confirmRecordsWithMissingFiles({
    recordsWithMissingFiles,
    dispatch,
  });
  if (confirmed && batchesState) batchesState.missingFilesConfirmed = true;
  return confirmed;
};

// resolves with the upload job summary when awaitUpload is true and the upload completes, null otherwise
const _onExportFileGenerationSucceeded = async ({
  result,
  onlyLocally,
  onlyRemote = false,
  conflictResolutionStrategy,
  onJobComplete,
  dispatch,
  silent = false,
  uploadMonitorOptions = {},
  awaitUpload = false,
  batchesState,
}: {
  result: RecordsExportFileGenerationJobResult | undefined;
  onlyLocally: boolean;
  onlyRemote?: boolean;
  conflictResolutionStrategy: string;
  onJobComplete: OnUploadJobComplete;
  dispatch: AppDispatch;
  silent?: boolean;
  uploadMonitorOptions?: UploadMonitorOptions;
  awaitUpload?: boolean;
  batchesState?: BatchesState;
}): Promise<UploadJobSummary | null> => {
  const { outputFileUri, recordsWithMissingFiles = [] } = result ?? {};
  if (!outputFileUri) {
    log.warn("exportRecords: export file generated without output file");
    return null;
  }

  if (
    !(await confirmMissingFilesIfNeeded({
      recordsWithMissingFiles,
      dispatch,
      silent,
      batchesState,
    }))
  ) {
    if (onlyRemote) await deleteExportFile(outputFileUri);
    return null;
  }

  const skipMissingFiles = recordsWithMissingFiles.length > 0;

  const availableExportTypes = [];
  if (!onlyLocally) {
    availableExportTypes.push(exportType.remote);
  }
  if (!onlyRemote && (await Files.isSharingAvailable())) {
    availableExportTypes.push(exportType.share);
  }
  const onConfirm = ({ selectedSingleChoiceValue }: OnConfirmParams) =>
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
        // getRemoteUploadChainProgressRanges
        uploadMonitorOptions: onlyRemote ? uploadMonitorOptions : {},
      }),
    );
  if (availableExportTypes.length === 1) {
    const uploadPromise = onConfirm({
      selectedSingleChoiceValue: availableExportTypes[0],
    }).finally(async () => {
      // never shared: not needed anymore once the upload has ended
      if (onlyRemote) await deleteExportFile(outputFileUri);
    });
    return awaitUpload ? uploadPromise : null;
  }
  dispatch(
    ConfirmActions.show({
      titleKey: "dataEntry:dataExport.selectTarget",
      messageKey: "dataEntry:dataExport.selectTargetMessage",
      onConfirm: async (params: OnConfirmParams) => {
        await onConfirm(params);
      },
      singleChoiceOptions: availableExportTypes.map((type) => ({
        value: type,
        label: `dataEntry:dataExport.target.${type}`,
      })),
      defaultSingleChoiceValue: availableExportTypes[0],
      confirmButtonTextKey: "common:export",
    }),
  );
  return null;
};

type ExportRecordsParams = {
  cycle: string;
  recordUuids: string[];
  conflictResolutionStrategy?: string;
  onlyLocally?: boolean;
  onlyRemote?: boolean;
  onJobComplete?: OnUploadJobComplete | null;
  onEnd?: (() => void | Promise<void>) | null;
  silent?: boolean;
};

type ExportRecordsBatchParams = Omit<ExportRecordsParams, "onEnd"> & {
  filesAlreadyOnServerByRecordUuid?: Record<string, string[]>;
  // set when the upload is split in batches
  batch?: { index: number; count: number };
  batchesState?: BatchesState;
};

const getBatchMonitorOptions = (batch: ExportRecordsBatchParams["batch"]) => {
  const ranges = getRemoteUploadChainProgressRanges({
    batchIndex: batch?.index,
    batchCount: batch?.count,
  });
  const message = batch
    ? {
        messageKey: "dataEntry:dataExport.uploadBatch",
        messageParams: { batch: batch.index + 1, batchCount: batch.count },
      }
    : {};
  return {
    zipGeneration: { ...ranges.zipGeneration, ...message },
    uploadAndProcess: { progressRange: ranges.uploadAndProcess, ...message },
  };
};

// generates the zip of the given records, then sends or shares it;
// when part of a batch upload, resolves with the upload job summary once the upload completes (null otherwise)
const exportRecordsBatch =
  ({
    cycle,
    recordUuids,
    conflictResolutionStrategy = "overwriteIfUpdated",
    onlyLocally = false,
    onlyRemote = false,
    onJobComplete: onJobCompleteParam = null,
    silent = false,
    filesAlreadyOnServerByRecordUuid,
    batch,
    batchesState,
  }: ExportRecordsBatchParams) =>
  async (
    dispatch: AppDispatch,
    getState: AppGetState,
  ): Promise<UploadJobSummary | null> => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const lang = SurveySelectors.selectCurrentSurveyPreferredLang(state);
    const surveyId = survey.id;
    let dateModifiedByUuid: Record<string, string | null | undefined> = {};

    const onUploadComplete = async (jobComplete: UploadJobSummary) => {
      const {
        mergedRecordsMap = {},
        mergedSameRecordUuids = [],
        skippedRecordsUuids = [],
      } = jobComplete.result ?? {};

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
          ...new Set(Object.values(mergedRecordsMap)),
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

    // set by onJobComplete, called by the job monitor
    const postUploadProcessing: { promise?: Promise<void> } = {};
    const onJobComplete = (jobComplete: UploadJobSummary) => {
      postUploadProcessing.promise =
        DataEntryActionsRecordSync.runAsPostUploadProcessing(() =>
          onUploadComplete(jobComplete),
        );
      return postUploadProcessing.promise;
    };

    const monitorOptions = getBatchMonitorOptions(batch);
    const batchText = batch ? `${batch.index + 1}/${batch.count}` : "-";

    log.debug(
      `exportRecords: starting (recordUuids=${recordUuids?.length ?? 0}, onlyLocally=${onlyLocally}, onlyRemote=${onlyRemote}, silent=${silent}, batch=${batchText})`,
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
        filesAlreadyOnServerByRecordUuid,
      });

      // wired through the job monitor (rather than a plain job.start()) so the zip
      // preparation phase is observable and cancelable, same as the upload phase below
      // a job is always passed in, so this always resolves with a real result (or rejects)
      const jobComplete =
        (await JobMonitorActions.startAsync<RecordsExportFileGenerationJobResult>(
          {
            dispatch,
            job,
            titleKey: "dataEntry:dataExport.exportingData",
            autoDismiss: true,
            silent,
            ...(onlyRemote ? monitorOptions.zipGeneration : {}),
          },
        ))!;

      log.debug(
        `exportRecords: zip preparation succeeded, outputFileUri=${jobComplete.result?.outputFileUri}`,
      );

      const uploadJobComplete = await _onExportFileGenerationSucceeded({
        result: jobComplete.result,
        onlyLocally,
        onlyRemote,
        conflictResolutionStrategy,
        onJobComplete,
        dispatch,
        silent,
        uploadMonitorOptions: monitorOptions.uploadAndProcess,
        awaitUpload: !!batch,
        batchesState,
      });
      // the next batch starts only once this one's records have been updated
      await postUploadProcessing.promise;
      return uploadJobComplete;
    } catch (error) {
      // a failed job is rejected with its summary (see JobMonitorActions.startAsync)
      const failedJob = error as
        { status?: JobStatus; errors?: ExportFileGenerationErrors } | undefined;
      if (error instanceof JobCancelError) {
        // canceled by the user while preparing the export: nothing more to do
        log.debug("exportRecords: zip preparation canceled by the user");
      } else if (failedJob?.status === JobStatus.failed) {
        log.warn(
          `exportRecords: zip preparation failed: ${JSON.stringify(failedJob.errors)}`,
        );
        _onExportFileGenerationError({
          errors: failedJob.errors!,
          dispatch,
          silent,
        });
      } else {
        log.warn(`exportRecords: unexpected error: ${error}`);
        dispatch(handleDataExportError(error, silent));
      }
      return null;
    }
  };

// files already on the server are not sent again: they don't count in the batches size
const splitRecordsInUploadBatches = async ({
  survey,
  recordUuids,
}: {
  survey: CurrentSurvey;
  recordUuids: string[];
}): Promise<{
  batches: string[][];
  filesAlreadyOnServerByRecordUuid?: Record<string, string[]>;
}> => {
  const hasFileNodeDefs = Object.values(survey.nodeDefs ?? {}).some(
    (nodeDef) => NodeDefs.getType(nodeDef) === NodeDefType.file,
  );
  if (!hasFileNodeDefs) return { batches: [recordUuids] };
  try {
    const filesAlreadyOnServerByRecordUuid = survey.remoteId
      ? await RecordRemoteService.fetchFileUuidsByRecordUuid({
          surveyRemoteId: survey.remoteId,
          recordUuids,
        })
      : {};
    const filesSizeByRecordUuid = await RecordService.fetchRecordsFilesSize({
      surveyId: survey.id!,
      recordUuids,
      excludedFileUuidsByRecordUuid: filesAlreadyOnServerByRecordUuid,
    });
    const batches = splitRecordUuidsInBatches({
      recordUuids,
      filesSizeByRecordUuid,
    });
    return { batches, filesAlreadyOnServerByRecordUuid };
  } catch (error) {
    log.warn(`exportRecords: error splitting records in batches: ${error}`);
    return { batches: [recordUuids] };
  }
};

// sends the batches one after the other, stopping at the first one not completed
const uploadRecordsInBatches =
  ({
    batches,
    onJobComplete,
    ...otherParams
  }: Omit<ExportRecordsBatchParams, "recordUuids" | "batch"> & {
    batches: string[][];
  }) =>
  async (dispatch: AppDispatch) => {
    const batchesState: BatchesState = { missingFilesConfirmed: false };
    const jobsComplete: UploadJobSummary[] = [];
    for (const [index, recordUuids] of batches.entries()) {
      const jobComplete = await dispatch(
        exportRecordsBatch({
          ...otherParams,
          recordUuids,
          batch: { index, count: batches.length },
          batchesState,
        }),
      );
      if (!jobComplete) {
        log.debug(
          `exportRecords: batch ${index + 1}/${batches.length} not completed, remaining batches skipped`,
        );
        break;
      }
      jobsComplete.push(jobComplete);
    }
    const lastJobComplete = jobsComplete.at(-1);
    if (!lastJobComplete || !onJobComplete) return;
    const missingFiles = jobsComplete.reduce(
      (acc, job) => acc + (job.result?.missingFiles ?? 0),
      0,
    );
    await DataEntryActionsRecordSync.runAsPostUploadProcessing(async () => {
      await onJobComplete({
        ...lastJobComplete,
        result: { ...lastJobComplete.result, missingFiles },
      });
    });
  };

export const exportRecords =
  ({ onEnd = null, ...params }: ExportRecordsParams) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const { onlyRemote = false, recordUuids } = params;
    if (onlyRemote) {
      const survey = SurveySelectors.selectCurrentSurvey(getState())!;
      const { batches, filesAlreadyOnServerByRecordUuid } =
        await splitRecordsInUploadBatches({ survey, recordUuids });
      if (batches.length > 1) {
        log.debug(
          `exportRecords: ${recordUuids.length} record(s) split in ${batches.length} upload batches`,
        );
        await dispatch(
          uploadRecordsInBatches({
            ...params,
            batches,
            filesAlreadyOnServerByRecordUuid,
          }),
        );
        await onEnd?.();
        return;
      }
      await dispatch(
        exportRecordsBatch({ ...params, filesAlreadyOnServerByRecordUuid }),
      );
    } else {
      await dispatch(exportRecordsBatch(params));
    }
    await onEnd?.();
  };
