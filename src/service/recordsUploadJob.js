import { JobMobile } from "model";

import { RecordService } from "./recordService";

export class RecordsUploadJob extends JobMobile {
  constructor({ user, survey, cycle, fileUri, conflictResolutionStrategy }) {
    super({ user, survey, cycle, fileUri, conflictResolutionStrategy });
  }

  async execute() {
    const { survey, cycle, fileUri, conflictResolutionStrategy } = this.context;

    const { promise, cancel } = RecordService.uploadRecordsToRemoteServer({
      survey,
      cycle,
      fileUri,
      conflictResolutionStrategy,
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        this.summary.total = total;
        this.summary.processed = loaded;
        this.emitSummaryUpdateEvent();
      },
    });

    this.cancelUpload = cancel;
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
