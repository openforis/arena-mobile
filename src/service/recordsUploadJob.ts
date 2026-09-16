import { JobMobile, JobMobileContext, SurveyMobile } from "model";

import { RecordService } from "./recordService";

type RecordsUploadJobContext = JobMobileContext & {
  cycle: string;
  fileUri: string;
  conflictResolutionStrategy: string;
  skipMissingFiles: boolean;
};

export class RecordsUploadJob extends JobMobile<RecordsUploadJobContext> {
  cancelUpload: any;
  remoteJob: any;
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy,
    skipMissingFiles = false,
  }: any) {
    super({ user, survey, cycle, fileUri, conflictResolutionStrategy, skipMissingFiles });
    this.cancelUpload = null; // cancels upload request
    this.remoteJob = null; // job started on remote server after file upload
  }

  async execute() {
    const { survey, cycle, fileUri, conflictResolutionStrategy, skipMissingFiles } = this.context;

    const startFromChunk =
      this.processed > 0 ? Math.floor(this.processed) : 1;

    this.logger.debug(
      `RecordsUploadJob: uploading ${fileUri} (startFromChunk=${startFromChunk})`,
    );

    const { promise, cancel } = RecordService.uploadRecordsToRemoteServer({
      survey: survey as SurveyMobile,
      cycle,
      fileUri,
      fileId: this.uuid,
      conflictResolutionStrategy,
      skipMissingFiles,
      startFromChunk,
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
      this.logger.debug(`RecordsUploadJob: upload complete, server-side job=${job?.uuid}`);
    } catch (error) {
      this.logger.error(`RecordsUploadJob: upload failed: ${error}`);
      throw error;
    }
  }

  override async cancel() {
    this.cancelUpload?.();
    await super.cancel();
  }

  override async generateResult() {
    const { remoteJob } = this;
    return { remoteJob };
  }
}
