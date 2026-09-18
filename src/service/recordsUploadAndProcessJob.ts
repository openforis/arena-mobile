import { JobEvent, JobStatus } from "@openforis/arena-core";

import { JobMobile } from "model";

import { RecordsUploadAndProcessJobContext } from "./RecordsUploadAndProcessJobContext";
import { RecordsUploadJob } from "./recordsUploadJob";
import { RemoteJobWatcherJob } from "./remoteJobWatcherJob";

// uploads the records zip, then watches the server-side job it kicks off, as ONE job: this only
// merges the upload and server-side processing phases (not the zip-preparation phase before
// them) because those two never have a user-facing gate in between them (unlike zip preparation,
// which can be followed by a "some files are missing, continue?" confirmation, or a share-vs-send
// choice) - see startUploadDataToRemoteServer/REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES in
// actionsDataExport.ts for how this bridges with that separate first phase. Composing them like
// this (rather than running them as two separate job-monitor calls) gets one continuous 0-100%
// progress bar for free from JobBase's own inner-job progress weighting, instead of needing to
// fake it the way the zip-preparation -> this bridge still does.
// @ts-ignore: execute method not implemented but not needed, since inner jobs are provided
export class RecordsUploadAndProcessJob extends JobMobile<RecordsUploadAndProcessJobContext> {
  constructor({
    user,
    survey,
    cycle,
    fileUri,
    conflictResolutionStrategy,
    skipMissingFiles = false,
  }: any) {
    super({ user, survey, cycle, fileUri, conflictResolutionStrategy, skipMissingFiles }, [
      new RecordsUploadJob({
        user,
        survey,
        cycle,
        fileUri,
        conflictResolutionStrategy,
        skipMissingFiles,
      }),
      new RemoteJobWatcherJob({ user, survey }),
    ]);
  }

  override async onInnerJobEvent(event: JobEvent) {
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

  override async generateResult() {
    const watcherJob = this.innerJobs?.[1];
    return watcherJob?.result;
  }
}
