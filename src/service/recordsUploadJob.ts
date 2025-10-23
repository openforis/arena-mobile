import { JobMobile } from "model";

import { RecordService } from "./recordService";

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
export class RecordsUploadJob extends JobMobile {
  cancelUpload: any;
  context: any;
  emitSummaryUpdateEvent: any;
  remoteJob: any;
  summary: any;
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy
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
    // @ts-expect-error TS(2339): Property 'data' does not exist on type 'unknown'.
    const { data } = await promise;
    const { job } = data;
    this.remoteJob = job;
  }

  async cancel() {
    this.cancelUpload?.();
    await super.cancel();
  }

  async prepareResult() {
    const { remoteJob } = this;
    return { remoteJob };
  }
}
