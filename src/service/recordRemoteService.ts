import { Files, Functions, log, RNFileProcessor } from "utils";
import { RemoteService } from "./remoteService";
import { SurveyMobile } from "model/SurveyMobile";

// fallback used if no chunk size is provided - see settings:dataUploadChunkSizeKB
const DEFAULT_UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

const calculateUploadedBytes = ({
  chunk,
  uploadedChunkPercent,
  totalFileSize,
  chunkSize,
}: {
  chunk: number;
  uploadedChunkPercent: number;
  totalFileSize: number;
  chunkSize: number;
}): number => {
  const offset = Math.max(0, (chunk - 1) * chunkSize);
  const remainingBytes = Math.max(0, totalFileSize - offset);
  const currentChunkSize = Math.min(chunkSize, remainingBytes);
  const uploadedBytes =
    offset + uploadedChunkPercent * currentChunkSize;
  return Math.min(totalFileSize, uploadedBytes);
};

const fetchRecordsSummaries = async ({ surveyRemoteId, cycle }: any) => {
  const { data } = await RemoteService.get(
    `api/survey/${surveyRemoteId}/records/summary`,
    { cycle },
  );
  const { list } = data;
  return list;
};

// For each given record uuid, the uuids of the files the server already has stored for it -
// used to skip re-uploading file content that hasn't changed. Returns an empty result (i.e.
// nothing gets skipped, every file is uploaded as before) if the server doesn't support this
// endpoint yet, so this stays compatible with older Arena servers.
const fetchFileUuidsByRecordUuid = async ({
  surveyRemoteId,
  recordUuids,
}: any): Promise<Record<string, string[]>> => {
  try {
    const { data } = await RemoteService.post(
      `api/mobile/survey/${surveyRemoteId}/records/file-uuids`,
      { recordUuids },
    );
    return data?.fileUuidsByRecordUuid ?? {};
  } catch (error) {
    log.warn(`error fetching file uuids by record uuid: ${error}`);
    return {};
  }
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
  skipMissingFiles = false,
  chunkSize = DEFAULT_UPLOAD_CHUNK_SIZE,
  onUploadProgress,
}: {
  survey: SurveyMobile;
  cycle: string;
  fileUri: string;
  fileId: string;
  startFromChunk?: number;
  conflictResolutionStrategy: string;
  skipMissingFiles?: boolean;
  chunkSize?: number;
  onUploadProgress: (progressEvent: any) => void;
}): { promise: Promise<any>; cancel: () => void } => {
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
      chunkProcessor: async ({
        chunk,
        content,
        totalChunks,
        totalFileSize,
      }) => {
        log.debug(
          `Uploading chunk ${chunk} / ${totalChunks} for fileId ${fileId}`,
        );
        const params = {
          file: content,
          fileId,
          chunk,
          totalChunks,
          totalFileSize,
          cycle,
          conflictResolutionStrategy,
          skipMissingFiles,
        };
        const progressHandler = (progressEvent: any) => {
          const { progress: uploadedChunkPercent } = progressEvent;
          const uploadedBytes = calculateUploadedBytes({
            chunk,
            uploadedChunkPercent,
            totalFileSize,
            chunkSize,
          });
          debouncedUploadProgress({
            total: totalFileSize,
            loaded: uploadedBytes,
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
            resolve(result);
          }
        } finally {
          const tempFileUri = (content as any).uri;
          if (tempFileUri) {
            await Files.del(tempFileUri, true);
          }
        }
      },
      onError: async (error) => {
        await fileProcessor?.close();
        reject(error);
      },
      onComplete: async () => {
        await fileProcessor?.close();
      },
      chunkSize,
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
  fetchFileUuidsByRecordUuid,
  startExportRecords,
  downloadExportedRecordsFile,
  uploadRecords,
};
