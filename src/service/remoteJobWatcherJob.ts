import { JobStatus } from "@openforis/arena-core";

import { JobMobile } from "model";
import { RemoteJobService, WebSocketService } from "service";

import { RecordsUploadAndProcessJobContext } from "./RecordsUploadAndProcessJobContext";

// a stable identifier for this job class, independent of `this.constructor.name` (which a
// minified production build isn't guaranteed to preserve) - read by RecordsUploadAndProcessJob's
// caller (see actionsDataExport.ts) to tell which of its inner jobs is currently active/failed
export const REMOTE_JOB_WATCHER_JOB_TYPE = "RemoteJobWatcherJob";

// watches a job already running on the remote server (started by RecordsUploadJob) to
// completion, over the same websocket + "jobUpdate" event the app already used for this before
// this job existed - the difference is this now runs as a regular inner job (see
// RecordsUploadAndProcessJob), so its progress folds into one continuous bar together with the
// upload phase instead of restarting the job monitor's progress from 0%
export class RemoteJobWatcherJob extends JobMobile<RecordsUploadAndProcessJobContext> {
  private settle: ((error?: any) => void) | null = null;

  constructor({ user, survey }: any) {
    super({ user, survey, type: REMOTE_JOB_WATCHER_JOB_TYPE });
  }

  override async execute() {
    const { remoteJobUuid } = this.context;
    if (!remoteJobUuid) {
      throw new Error("RemoteJobWatcherJob: missing remoteJobUuid in context");
    }

    this.logger.debug(`RemoteJobWatcherJob: watching remote job ${remoteJobUuid}`);

    const ws = await WebSocketService.open();

    await new Promise<void>((resolve, reject) => {
      this.settle = (error) => {
        this.settle = null;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      ws.on(WebSocketService.EVENTS.jobUpdate, (remoteJobSummary: any) => {
        const { status, errors, processed, total, progressPercent, result } =
          remoteJobSummary ?? {};

        if (typeof total === "number" && typeof processed === "number") {
          this.total = total;
          this.processed = processed;
        } else if (typeof progressPercent === "number") {
          this.total = 100;
          this.processed = progressPercent;
        }

        switch (status) {
          case JobStatus.succeeded:
            this.setResult(result);
            this.settle?.();
            break;
          case JobStatus.failed:
            // preserve the server's own (often per-record) validation errors as-is, rather than
            // letting them get flattened by JobBase's default error handling (which wraps
            // whatever execute() throws into a single generic "appErrors:generic" entry) - see
            // RecordsUploadAndProcessJob.onInnerJobEvent for how this reaches the parent job
            this.errors = errors ?? {};
            this.settle?.(new Error("RemoteJobWatcherJob: remote job failed"));
            break;
          case JobStatus.canceled:
            // a cancellation already in progress (see this job's own `cancel()`) is what set our
            // own status - this just unblocks execute() once the server confirms it
            this.settle?.();
            break;
          default:
            // any other status (e.g. "running") is a progress-only update, already applied above
            break;
        }
      });
    });
  }

  override async cancel() {
    try {
      await RemoteJobService.cancelActiveJob();
    } catch (error) {
      this.logger.warn(`RemoteJobWatcherJob: failed to cancel remote job: ${error}`);
    }
    this.settle?.();
    await super.cancel();
  }

  override async beforeEnd() {
    await super.beforeEnd();
    WebSocketService.close();
  }
}
