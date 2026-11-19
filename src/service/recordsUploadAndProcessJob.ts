import { ArenaJobEvent, JobStatus } from "@openforis/arena-core";

import { JobMobile } from "model";

import { RecordsUploadAndProcessJobContext } from "./RecordsUploadAndProcessJobContext";
import { RecordsUploadJob } from "./recordsUploadJob";
import { RemoteJobWatcherJob } from "./remoteJobWatcherJob";

// result of the server-side records import job
export type RecordsUploadResult = {
  // local record uuid => uuid of the server record (same keys) it was merged into
  mergedRecordsMap?: Record<string, string>;
  // records merged with their own server copy (same uuid)
  mergedSameRecordUuids?: string[];
  skippedRecordsUuids?: string[];
  missingFiles?: number;
};

// uploads the records zip, then watches the server-side job it kicks off, as ONE job: this only
// merges the upload and server-side processing phases (not the zip-preparation phase before
// them) because those two never have a user-facing gate in between them (unlike zip preparation,
// which can be followed by a "some files are missing, continue?" confirmation, or a share-vs-send
// choice) - see startUploadDataToRemoteServer (actionsRecordsUpload.ts) and
// REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES (dataExportUtils.ts) for how this bridges with that separate first phase. Composing them like
// this (rather than running them as two separate job-monitor calls) gets one continuous 0-100%
// progress bar for free from JobBase's own inner-job progress weighting, instead of needing to
// fake it the way the zip-preparation -> this bridge still does.
export class RecordsUploadAndProcessJob extends JobMobile<RecordsUploadAndProcessJobContext> {
  constructor(context: RecordsUploadAndProcessJobContext) {
    const { user, survey } = context;
    const contextWithDefaults = {
      ...context,
      skipMissingFiles: context.skipMissingFiles ?? false,
    };
    super(contextWithDefaults, [
      new RecordsUploadJob(contextWithDefaults),
      new RemoteJobWatcherJob({ user, survey }),
    ]);
  }

  override onInnerJobEvent(event: ArenaJobEvent): Promise<void> {
    // JobBase's own onInnerJobEvent only copies the failed inner job's `status` up to this
    // (parent) job, not its `errors` - without this, this job's own `errors` (read from its
    // rejected/serialized summary by callers, e.g. startUploadDataToRemoteServer) would stay
    // empty even though the inner job (RecordsUploadJob or RemoteJobWatcherJob) recorded real
    // ones
    if (event.status === JobStatus.failed) {
      this.errors = this.combineInnerJobsErrors();
    }
    return super.onInnerJobEvent(event);
  }

  override generateResult(): Promise<RecordsUploadResult | undefined> {
    const watcherJob = this.innerJobs?.[1];
    return Promise.resolve(watcherJob?.result);
  }
}
