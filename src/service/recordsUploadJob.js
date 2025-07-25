import { JobMobile } from "model";

import { RecordService } from "./recordService";

export class RecordsUploadJob extends JobMobile {
  constructor({ survey, cycle, fileUri, conflictResolutionStrategy }) {
    super({ survey, cycle, fileUri, conflictResolutionStrategy });
  }

  async execute() {
    const { survey, cycle, fileUri, conflictResolutionStrategy } = this.context;

    const remoteJob = await RecordService.uploadRecordsToRemoteServer({
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

    this.remoteJob = remoteJob;
  }

  async prepareResult() {
    const { remoteJob } = this;
    return { remoteJob };
  }
}
