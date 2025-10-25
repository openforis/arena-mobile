import { JobMobile } from "model";

import { RecordService } from "./recordService";

// @ts-ignore
export class RecordsUploadJob extends JobMobile {
  cancelUpload: any;
  override emitSummaryUpdateEvent: any;
  remoteJob: any;
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy,
  }: any) {
    super({ user, survey, cycle, fileUri, conflictResolutionStrategy });
    this.cancelUpload = null; // cancels upload request
    this.remoteJob = null; // job started on remote server after file upload
  }

  async execute() {
    const { survey, cycle, fileUri, conflictResolutionStrategy } = this.context;

    const startFromChunk =
      this.summary.processed > 0 ? Math.floor(this.summary.processed) : 1;

    const { promise, cancel } = RecordService.uploadRecordsToRemoteServer({
      survey,
      cycle,
      fileUri,
      fileId: this.summary.uuid,
      conflictResolutionStrategy,
      startFromChunk,
      onUploadProgress: (progressEvent: any) => {
        const { loaded, total } = progressEvent;
        this.summary.total = total;
        this.summary.processed = loaded;
        this.emitSummaryUpdateEvent();
      },
    });
    this.cancelUpload = cancel;
    const { data } = (await promise) as any;
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
