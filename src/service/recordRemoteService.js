import { Files } from "utils";

import { RemoteService } from "./remoteService";
import { RNFileProcessor } from "utils/RNFileProcessor";

const fetchRecordsSummaries = async ({ surveyRemoteId, cycle }) => {
  const { data } = await RemoteService.get(
    `api/survey/${surveyRemoteId}/records/summary`,
    { cycle }
  );
  const { list } = data;
  return list;
};

const startExportRecords = async ({ survey, cycle, recordUuids }) => {
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

const downloadExportedRecordsFile = async ({ survey, fileName }) => {
  const { remoteId: surveyRemoteId } = survey;
  const fileUri = await RemoteService.getFile(
    `api/survey/${surveyRemoteId}/records/export/download`,
    { fileName }
  );
  return fileUri;
};

const uploadRecords = async ({
  survey,
  cycle,
  fileUri,
  conflictResolutionStrategy,
  onUploadProgress,
}) => {
  const surveyRemoteId = survey.remoteId;
  let fileProcessor = null;
  const promise = new Promise((resolve, reject) => {
    fileProcessor = new RNFileProcessor({
      filePath: fileUri,
      chunkProcessor: async ({ chunk, totalChunks, content }) => {
        const params = {
          file: content,
          cycle,
          conflictResolutionStrategy,
        };
        const progressHandler = (progressEvent) => {
          const { processed: uploadedChunk, total: chunkSize } = progressEvent;
          const previouslyUploadedChunks = chunk - 1;
          const uploadedChunkPercent = uploadedChunk / chunkSize;
          const uploadedChunks =
            previouslyUploadedChunks + uploadedChunkPercent;
          onUploadProgress({ total: totalChunks, processed: uploadedChunks });
        };
        const { promise } = await RemoteService.postCancelableMultipartData(
          `api/mobile/survey/${surveyRemoteId}`,
          params,
          progressHandler
        );
        const result = await promise;
        if (chunk === totalChunks) {
          resolve(result);
        }
      },
      onError: reject,
    });
    fileProcessor.start();
  });
  return { promise, cancel: () => fileProcessor.cancel() };
};

export const RecordRemoteService = {
  fetchRecordsSummaries,
  startExportRecords,
  downloadExportedRecordsFile,
  uploadRecords,
};
