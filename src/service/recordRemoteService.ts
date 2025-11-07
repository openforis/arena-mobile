import { RNFileProcessor } from "utils/RNFileProcessor";

import { Functions } from "utils/Functions";
import { RemoteService } from "./remoteService";

const uploadChunkSize = 700 * 1024; // 700KB (post requests bigger than this are truncated, check why)

const fetchRecordsSummaries = async ({ surveyRemoteId, cycle }: any) => {
  const { data } = await RemoteService.get(
    `api/survey/${surveyRemoteId}/records/summary`,
    { cycle }
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
    params
  );
  return job;
};

const downloadExportedRecordsFile = async ({ survey, fileName }: any) => {
  const { remoteId: surveyRemoteId } = survey;
  const fileUri = await RemoteService.getFile(
    `api/survey/${surveyRemoteId}/records/export/download`,
    { fileName }
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
  requestTimeout = 20000,
}: any) => {
  const surveyRemoteId = survey.remoteId;
  let fileProcessor: any = null;

  const debouncedUploadProgress = Functions.throttle(
    ({ total, loaded }: any) => {
      onUploadProgress({ total, loaded });
    },
    1000
  );

  let lastRequestCancel: any = null;
  const promise = new Promise((resolve, reject) => {
    fileProcessor = new RNFileProcessor({
      filePath: fileUri,
      chunkProcessor: async ({ chunk, totalChunks, content }) => {
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
            progressHandler
          );
        lastRequestCancel = cancel;
        const result = await promise;

        if (chunk === totalChunks) {
          resolve(result);
        }
      },
      onError: reject,
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
