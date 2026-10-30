import { JobMobile, SurveyMobile } from "model";

import { RecordsUploadAndProcessJobContext } from "./RecordsUploadAndProcessJobContext";
import { RecordService } from "./recordService";
import { SettingsService } from "./settingsService";

// a stable identifier for this job class, independent of `this.constructor.name` (which a
// minified production build isn't guaranteed to preserve) - read by RecordsUploadAndProcessJob's
// caller (see actionsDataExport.ts) to tell which of its inner jobs is currently active/failed
export const RECORDS_UPLOAD_JOB_TYPE = "RecordsUploadJob";

export class RecordsUploadJob extends JobMobile<RecordsUploadAndProcessJobContext> {
  cancelUpload: any;
  remoteJob: any;
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy,
    skipMissingFiles = false,
    uploadState,
  }: any) {
    super({
      user,
      survey,
      cycle,
      fileUri,
      conflictResolutionStrategy,
      skipMissingFiles,
      uploadState,
      type: RECORDS_UPLOAD_JOB_TYPE,
    });
    this.cancelUpload = null; // cancels upload request
    this.remoteJob = null; // job started on remote server after file upload
  }

  override async execute() {
    // always provided by the constructor (see RecordsUploadAndProcessJobContext for why they're
    // typed as optional there)
    const {
      survey,
      cycle,
      fileUri,
      conflictResolutionStrategy,
      skipMissingFiles,
      uploadState,
    } = this.context as Required<typeof this.context>;

    const { dataUploadChunkSizeKB } = await SettingsService.fetchSettings();
    const chunkSize = uploadState.chunkSize ?? dataUploadChunkSizeKB * 1024;
    uploadState.chunkSize = chunkSize;
    const { fileId, nextChunk: startFromChunk } = uploadState;

    this.logger.debug(
      `RecordsUploadJob: uploading ${fileUri} (startFromChunk=${startFromChunk}, chunkSize=${chunkSize})`,
    );

    const { promise, cancel } = RecordService.uploadRecordsToRemoteServer({
      survey: survey as SurveyMobile,
      cycle,
      fileUri,
      fileId,
      conflictResolutionStrategy,
      skipMissingFiles,
      startFromChunk,
      chunkSize,
      onChunkUploaded: (chunk: number) => {
        uploadState.nextChunk = chunk + 1;
      },
      onUploadProgress: (progressEvent: any) => {
        const { loaded, total } = progressEvent;
        this.total = total;
        this.processed = loaded;
      },
    });
    this.cancelUpload = cancel;
    try {
      const { data } = await promise;
      const { job } = data;
      this.remoteJob = job;
      this.setContext({ remoteJobUuid: job?.uuid });
      this.logger.debug(
        `RecordsUploadJob: upload complete, server-side job=${job?.uuid}`,
      );
    } catch (error) {
      this.logger.error(`RecordsUploadJob: upload failed: ${error}`);
      throw error;
    }
  }

  override async cancel() {
    this.cancelUpload?.();
    await super.cancel();
  }

  override generateResult() {
    const { remoteJob } = this;
    return Promise.resolve({ remoteJob });
  }
}
