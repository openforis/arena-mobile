import { JobStatus } from "@openforis/arena-core";

import type { AppDispatch } from "state/store";
import { log } from "utils";

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
export const REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES = {
  zipGeneration: { progressRangeStart: 0, progressRangeEnd: 33 },
  uploadAndProcess: { progressRangeStart: 33, progressRangeEnd: 100 },
};

export const errorOrJobToString = (errorOrJob: any) => {
  if (!errorOrJob) {
    return "";
  }
  if (errorOrJob instanceof Error) {
    return errorOrJob.message ?? errorOrJob.toString();
  }
  // job
  if (errorOrJob.status === JobStatus.failed) {
    return JSON.stringify(errorOrJob.errors);
  }
  return JSON.stringify(errorOrJob);
};

// a failed job's error has already been collapsed into a {key, params: {text}} shape by the
// time it gets here (see JobBase.getErrorInfo), losing the original HTTP status - fall back to
// sniffing it out of the stringified error text
export const errorTextLooksLikeAuthError = (text: string) =>
  /\bstatus code 401\b/.test(text);

// a raw axios error still has response.status
export const isAuthError = (error: any) =>
  error?.response?.status === 401 ||
  error?.status === 401 ||
  errorTextLooksLikeAuthError(errorOrJobToString(error));

export const handleDataExportError =
  (error: any, silent = false) =>
  (dispatch: AppDispatch) => {
    if (silent) {
      // an unattended tick must never surface a blocking error dialog; shown through the sync
      // status icon instead, which also stops further automatic ticks until the user retries
      log.warn(`auto-sync: export/upload failed: ${errorOrJobToString(error)}`);
      dispatch(
        isAuthError(error)
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
