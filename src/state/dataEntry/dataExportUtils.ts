import { ArenaJobSerialized, JobStatus } from "@openforis/arena-core";

import type { AppDispatch } from "state/store";
import { log } from "utils";
import { HttpErrors } from "utils/HttpErrors";

import { AutoSyncActions } from "../autoSync";
import { MessageActions } from "../message";

// zip preparation and upload+processing (see RecordsUploadAndProcessJob) are two separate
// job-monitor calls (see actionsDataExport and actionsRecordsUpload), each with its own 0-100%
// progress - without this, the bar would restart from 0% between them instead of climbing
// smoothly through one continuous operation (see JobMonitorState.progressRangeStart/End). Only
// applied when going straight to the remote server (onlyRemote): a plain "export" only knows
// whether it'll continue into an upload after the zip is ready and the user picks a target, so
// its zip-preparation phase can't be pre-allocated a slice of a chain that might not happen.
// Upload and server-side processing don't need their own synthetic split the way zip-generation
// does here: they're composed into one job (RecordsUploadAndProcessJob), so JobBase's own
// inner-job progress weighting already makes that half continuous natively.
export type ProgressRange = {
  progressRangeStart: number;
  progressRangeEnd: number;
};

export type RemoteUploadChainProgressRanges = {
  zipGeneration: ProgressRange;
  uploadAndProcess: ProgressRange;
};

/**
 * Progress ranges of the phases of the upload of a batch of records: the batches share the overall progress equally.
 */
export const getRemoteUploadChainProgressRanges = ({
  batchIndex = 0,
  batchCount = 1,
}: {
  batchIndex?: number;
  batchCount?: number;
} = {}): RemoteUploadChainProgressRanges => {
  const batchSize = 100 / batchCount;
  const start = batchIndex * batchSize;
  const zipEnd = start + batchSize * 0.33;
  return {
    zipGeneration: { progressRangeStart: start, progressRangeEnd: zipEnd },
    uploadAndProcess: {
      progressRangeStart: zipEnd,
      progressRangeEnd: start + batchSize,
    },
  };
};

export const REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES =
  getRemoteUploadChainProgressRanges();

export const errorOrJobToString = (errorOrJob: unknown) => {
  if (!errorOrJob) {
    return "";
  }
  if (errorOrJob instanceof Error) {
    return errorOrJob.message ?? errorOrJob.toString();
  }
  // job
  const job = errorOrJob as Partial<ArenaJobSerialized<unknown>>;
  if (job.status === JobStatus.failed) {
    return JSON.stringify(job.errors);
  }
  return JSON.stringify(errorOrJob);
};

// a failed job's error has already been collapsed into a {key, params: {text}} shape by the
// time it gets here (see JobBase.getErrorInfo), losing the original HTTP status - fall back to
// sniffing it out of the stringified error text
export const errorTextLooksLikeAuthError = (text: string) =>
  /\bstatus code 401\b/.test(text);

// raw/wrapped HTTP errors carry the status, failed jobs only the error text
export const isAuthErrorOrFailedJobAuthError = (error: unknown) =>
  HttpErrors.isUnauthorized(error) ||
  errorTextLooksLikeAuthError(errorOrJobToString(error));

export const handleDataExportError =
  (error: unknown, silent = false) =>
  (dispatch: AppDispatch) => {
    if (silent) {
      // an unattended tick must never surface a blocking error dialog; shown through the sync
      // status icon instead, which also stops further automatic ticks until the user retries
      log.warn(`auto-sync: export/upload failed: ${errorOrJobToString(error)}`);
      dispatch(
        isAuthErrorOrFailedJobAuthError(error)
          ? AutoSyncActions.authError()
          : AutoSyncActions.checkError(),
      );
      return;
    }
    dispatch(
      MessageActions.setMessage({
        content: "dataEntry:dataExport.error",
        contentParams: { details: errorOrJobToString(error) },
      }),
    );
  };
