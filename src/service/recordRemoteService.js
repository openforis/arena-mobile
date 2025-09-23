import { UUIDs } from "@openforis/arena-core";
import { RNFileProcessor } from "utils/RNFileProcessor";

import { Functions } from "utils/Functions";
import { RemoteService } from "./remoteService";

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

const uploadRecords = ({
  survey,
  cycle,
  fileUri,
  conflictResolutionStrategy,
  onUploadProgress,
}) => {
  const surveyRemoteId = survey.remoteId;
  const fileId = UUIDs.v4();
  let fileProcessor = null;

  const debouncedUploadProgress = Functions.throttle(({ total, loaded }) => {
    onUploadProgress({ total, loaded });
  }, 1000);

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
        const progressHandler = (progressEvent) => {
          const { progress: uploadedChunkPercent } = progressEvent;
          const previouslyUploadedChunks = chunk - 1;
          const uploadedChunks =
            previouslyUploadedChunks + uploadedChunkPercent;
          debouncedUploadProgress({
            total: totalChunks,
            loaded: uploadedChunks,
          });
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
      chunkSize: 1024,
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
