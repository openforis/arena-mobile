import { Functions, log, RNFileProcessor } from "utils";
import { RemoteService } from "./remoteService";

const uploadChunkSize = 2 * 1024 * 1024; // 2MB

const fetchRecordsSummaries = async ({ surveyRemoteId, cycle }: any) => {
  const { data } = await RemoteService.get(
    `api/survey/${surveyRemoteId}/records/summary`,
    { cycle },
  );
  const { list } = data;
  return list;
};

const startExportRecords = async ({ survey, cycle, recordUuids }: any) => {
  const { remoteId: surveyRemoteId } = survey;
  const params = { cycle, recordUuids };

  const {
    data: { job },
  } = await RemoteService.post(
    `api/survey/${surveyRemoteId}/records/export`,
    params,
  );
  return job;
};

const downloadExportedRecordsFile = async ({ survey, fileName }: any) => {
  const { remoteId: surveyRemoteId } = survey;
  const fileUri = await RemoteService.getFile(
    `api/survey/${surveyRemoteId}/records/export/download`,
    { fileName },
  );
  return fileUri;
};

const uploadRecords = ({
  survey,
  cycle,
  fileUri,
  fileId,
  startFromChunk,
  conflictResolutionStrategy,
  onUploadProgress,
}: any) => {
  const surveyRemoteId = survey.remoteId;
  let fileProcessor: RNFileProcessor;

  const debouncedUploadProgress = Functions.throttle(
    ({ total, loaded }: any) => {
      onUploadProgress({ total, loaded });
    },
    1000,
  );

  let lastRequestCancel: any = null;
  const promise = new Promise((resolve, reject) => {
    fileProcessor = new RNFileProcessor({
      fileId,
      filePath: fileUri,
      chunkProcessor: async ({ chunk, totalChunks, content }) => {
        log.debug(
          `Uploading chunk ${chunk} / ${totalChunks} for fileId ${fileId}`,
        );
        const params = {
          file: content,
          fileId,
          chunk,
          totalChunks,
          cycle,
          conflictResolutionStrategy,
        };
        const progressHandler = (progressEvent: any) => {
          const { progress: uploadedChunkPercent } = progressEvent;
          const previouslyUploadedChunks = chunk - 1;
          const uploadedChunks =
            previouslyUploadedChunks + uploadedChunkPercent;
          debouncedUploadProgress({
            total: totalChunks,
            loaded: uploadedChunks,
          });
        };

        const { promise, cancel } =
          await RemoteService.postCancelableMultipartData(
            `api/mobile/survey/${surveyRemoteId}`,
            params,
            progressHandler,
          );
        lastRequestCancel = cancel;
        try {
          const result = await promise;

          if (chunk === totalChunks) {
            log.debug(`All chunks uploaded for fileId ${fileId}`);
            await fileProcessor?.close();
            resolve(result);
          }
        } finally {
          const tempFileUri = (content as any).uri;
          if (tempFileUri) {
            log.debug(`Deleting temp file chunk: ${tempFileUri}`);
            // await Files.deleteFile(tempFileUri);
          }
        }
      },
      onError: async (error) => {
        await fileProcessor?.close();
        reject(error);
      },
      chunkSize: uploadChunkSize,
      maxTryings: 2,
    });
    fileProcessor.start(startFromChunk);
  });
  return {
    promise,
    cancel: () => {
      lastRequestCancel?.();
      fileProcessor.stop();
    },
  };
};

export const RecordRemoteService = {
  fetchRecordsSummaries,
  startExportRecords,
  downloadExportedRecordsFile,
  uploadRecords,
};
