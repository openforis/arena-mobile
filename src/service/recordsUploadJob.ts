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
    const { data } = await promise;
    const { job } = data;
    this.remoteJob = job;
  }

  override async cancel() {
    this.cancelUpload?.();
    await super.cancel();
  }

  override async prepareResult() {
    const { remoteJob } = this;
    return { remoteJob };
  }
}
