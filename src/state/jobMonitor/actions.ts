import { JobStatus, Objects } from "@openforis/arena-core";

import { JobCancelError, JobMobile, JobMobileContext } from "model";
import { RemoteJobService, WebSocketService } from "service";
import { log } from "utils";

import { createCallbackRegistry } from "../callbackRegistry";
import type { AppDispatch, AppGetState, RootState } from "../store";
import {
  buildUploadStats,
  calculateJobProgressPercent,
  InnerJobUiConfig,
  isJobStatusEnded,
  JobSummary,
  resolveInnerJobUi,
  TransferSample,
} from "./jobProgress";
import { JobMonitorSliceActions } from "./reducer";
import type { JobMonitorState } from "./types";

// the websocket can miss the final update (e.g. a job ending before the handshake)
const REMOTE_JOB_STATUS_POLL_INTERVAL_MS = 30_000;

// progress updates can come for every processed item: every dispatch re-runs all the store subscribers
const JOB_MONITOR_UPDATE_MIN_INTERVAL_MS = 250;

const getJobMonitorState = (state: RootState) => state.jobMonitor;

type JobMonitorCallbacks = {
  onCancel?: () => Promise<void> | void;
  onClose?: () => void;
};

// callbacks are kept outside of the store (functions are not serializable): the store contains
// only the callbacksId they are registered with
const JobMonitorCallbacksRegistry =
  createCallbackRegistry<JobMonitorCallbacks>();

type JobUpdatePayload = Partial<JobMonitorState>;

const createOnJobUpdateCallback = <R>({
  dispatch,
  job,
  autoDismiss,
  onJobComplete,
  onJobEnd,
  showTransferStats = false,
  innerJobUiConfigByType,
  silent = false,
}: Pick<
  JobStartParams<R>,
  | "job"
  | "autoDismiss"
  | "onJobComplete"
  | "onJobEnd"
  | "showTransferStats"
  | "innerJobUiConfigByType"
  | "silent"
> & { dispatch: AppDispatch }): ((jobSummary: JobSummary<R>) => void) => {
  let previousSample: TransferSample | null = null;
  let lastUpdatePayload: JobUpdatePayload | null = null;
  let lastUpdateTime = 0;

  return (jobSummary: JobSummary<R>) => {
    const { status, errors, processed, total } = jobSummary;
    const progressPercent = calculateJobProgressPercent({ jobSummary });

    const innerJobUi = resolveInnerJobUi({
      jobSummary,
      innerJobUiConfigByType,
    });
    const currentShowTransferStats = innerJobUi
      ? !!innerJobUi.config.showTransferStats
      : showTransferStats;
    // a composite job's own processed/total just count finished inner jobs (e.g. 1 of 2), not
    // bytes - use the current inner job's own numbers for transfer stats instead
    const statsSource = innerJobUi?.currentInnerJobSummary ?? {
      processed,
      total,
    };

    const uploadStats = buildUploadStats({
      showTransferStats: currentShowTransferStats,
      status,
      processed: statsSource.processed,
      total: statsSource.total,
      previousSample,
    });
    previousSample = uploadStats.previousSample;

    const payload: JobUpdatePayload = {
      progressPercent,
      status,
      errors,
      ...(innerJobUi
        ? {
            titleKey: innerJobUi.config.titleKey,
            showTransferStats: currentShowTransferStats,
          }
        : {}),
      transferTotalBytes: uploadStats.transferTotalBytes,
      transferSpeedBytesPerSec: uploadStats.transferSpeedBytesPerSec,
      etaSeconds: uploadStats.etaSeconds,
    };
    const now = Date.now();
    // status changes are always dispatched, progress at most every JOB_MONITOR_UPDATE_MIN_INTERVAL_MS
    const skipUpdate =
      lastUpdatePayload?.status === status &&
      (Objects.isEqual(lastUpdatePayload, payload) ||
        now - lastUpdateTime < JOB_MONITOR_UPDATE_MIN_INTERVAL_MS);
    if (!skipUpdate) {
      lastUpdatePayload = payload;
      lastUpdateTime = now;
      dispatch(JobMonitorSliceActions.update(payload));
    }
    if (isJobStatusEnded(status)) {
      if (!job) {
        // remote job, no local job instance (see JobStartParams.jobUuid) - only this callback
        // knows the websocket subscription is done with, since the caller never gets a job
        // instance of its own to clean up
        WebSocketService.close();
      }
      if (status === JobStatus.succeeded) {
        // close before notifying: existing behavior for autoDismiss, extended to silent jobs
        // too - an unattended job has no dialog for the user to dismiss themselves (see
        // JobMonitorDialog's `visible={isOpen && !silent}`), so isOpen must reset on its own
        // or it gets stuck forever - and with it, anything derived from it (e.g. the
        // auto-sync icon's spinner, or RecordsList's post-tick refresh)
        if (autoDismiss || silent) {
          dispatch(close());
        }
        onJobComplete?.(jobSummary);
      } else if (silent) {
        // same reasoning, for a job that failed or was canceled instead
        dispatch(close());
      }
      onJobEnd?.(jobSummary);
    }
  };
};

const createOnCancelCallback = ({
  job,
  onCancelProp,
}: {
  job: JobStartParams["job"];
  onCancelProp: JobStartParams["onCancel"];
}) => {
  if (!job && !onCancelProp) return undefined;
  return async () => {
    await job?.cancel();
    onCancelProp?.();
  };
};

// remote job: updates come through the Web Socket, plus a periodic status poll
const monitorRemoteJob = async <R>({
  jobUuid,
  getState,
  onJobUpdate,
}: {
  jobUuid: string;
  getState: AppGetState;
  onJobUpdate: (jobSummary: JobSummary<R>) => void;
}) => {
  const ws = await WebSocketService.open();
  const onRemoteJobUpdate = (remoteJobSummary: JobSummary<R> | undefined) => {
    if (!remoteJobSummary) return;
    const { uuid, status } = remoteJobSummary;
    // the server notifies all the jobs of the user
    if (uuid && uuid !== jobUuid) return;
    if (isJobStatusEnded(status)) clearInterval(pollInterval);
    onJobUpdate(remoteJobSummary);
  };
  const pollInterval = setInterval(async () => {
    // another job has replaced this one in the monitor
    if (getJobMonitorState(getState()).jobUuid !== jobUuid) {
      clearInterval(pollInterval);
      return;
    }
    try {
      const { data } = await RemoteJobService.fetchJob(jobUuid);
      if (isJobStatusEnded(data?.status)) onRemoteJobUpdate(data);
    } catch (error) {
      log.debug(`remote job status poll failed: ${error}`);
    }
  }, REMOTE_JOB_STATUS_POLL_INTERVAL_MS);
  ws!.on(WebSocketService.EVENTS.jobUpdate, onRemoteJobUpdate);
};

type JobStartParams<R = unknown> = {
  // job must be provided when monitoring a local job
  job?: JobMobile<JobMobileContext> | null;
  // jobUuid must be provided when monitoring a remote-only job (no local job instance) - see
  // actionsRecordsImport.ts's fetchRecordsFromServer for the one caller that needs this
  jobUuid?: string | null;
  titleKey?: string;
  cancelButtonTextKey?: string;
  closeButtonTextKey?: string;
  messageKey?: string;
  messageParams?: Record<string, unknown>;
  onJobComplete?: (jobSummary: JobSummary<R>) => void;
  onJobEnd?: (jobSummary: JobSummary<R>) => void;
  onCancel?: () => void;
  onClose?: () => void;
  autoDismiss?: boolean;
  silent?: boolean;
  // see JobMonitorState.progressRangeStart/End - lets a caller running a chain of jobs (e.g.
  // exportRecords's zip preparation -> upload -> server-side processing) place each one's own
  // 0-100% progress within its slice of the chain's overall progress
  progressRangeStart?: number;
  progressRangeEnd?: number;
  showTransferStats?: boolean;
  transferSizeTextKey?: string | null;
  transferSpeedTextKey?: string | null;
  transferEtaTextKey?: string | null;
  // see resolveInnerJobUi - only meaningful when `job` is composed of inner jobs (e.g.
  // RecordsUploadAndProcessJob)
  innerJobUiConfigByType?: Record<string, InnerJobUiConfig>;
};

const start =
  <R = unknown>({
    job = null,
    jobUuid = null,
    titleKey = "common:processing",
    cancelButtonTextKey = "common:cancel",
    closeButtonTextKey = "common:close",
    messageKey,
    messageParams = {},
    onJobComplete = undefined,
    onJobEnd = undefined,
    onCancel: onCancelProp = undefined,
    onClose = undefined,
    autoDismiss = false,
    silent = false,
    progressRangeStart = 0,
    progressRangeEnd = 100,
    showTransferStats = false,
    transferSizeTextKey = null,
    transferSpeedTextKey = null,
    transferEtaTextKey = null,
    innerJobUiConfigByType = undefined,
  }: JobStartParams<R>) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    // the state of a previous job (if any) is replaced: its callbacks won't be used anymore
    JobMonitorCallbacksRegistry.remove(
      getJobMonitorState(getState()).callbacksId,
    );
    const onCancel = createOnCancelCallback({ job, onCancelProp });
    const callbacksId = JobMonitorCallbacksRegistry.register({
      onCancel,
      onClose,
    });
    dispatch(
      JobMonitorSliceActions.start({
        jobUuid,
        titleKey,
        cancelButtonTextKey,
        closeButtonTextKey,
        messageKey,
        messageParams,
        callbacksId,
        autoDismiss,
        silent,
        progressRangeStart,
        progressRangeEnd,
        showTransferStats,
        transferTotalBytes: null,
        transferSpeedBytesPerSec: null,
        transferSizeTextKey,
        transferSpeedTextKey,
        transferEtaTextKey,
        etaSeconds: null,
      }),
    );

    const onJobUpdate = createOnJobUpdateCallback({
      dispatch,
      job,
      autoDismiss,
      onJobComplete,
      onJobEnd,
      showTransferStats,
      innerJobUiConfigByType,
      silent,
    });

    if (job) {
      // local job: listen to job update events
      if (job.isEnded()) {
        onJobUpdate(job.toJSON() as JobSummary<R>);
      } else {
        job.onEvent(() => onJobUpdate(job.toJSON() as JobSummary<R>));
      }
    } else if (jobUuid) {
      await monitorRemoteJob({ jobUuid, getState, onJobUpdate });
    }
  };

const startAsync = async <R = unknown>({
  dispatch,
  ...otherParams
}: JobStartParams<R> & { dispatch: AppDispatch }): Promise<
  JobSummary<R> | undefined
> =>
  new Promise((resolve, reject) => {
    const { job } = otherParams;
    if (job) {
      job.start().catch((error: Error) => {
        reject(error);
      });
    }
    dispatch(
      start({
        ...otherParams,
        onJobEnd: (jobEnd: JobSummary<R>) => {
          const { status } = jobEnd;
          if (status === JobStatus.succeeded) {
            resolve(jobEnd);
          } else if (status === JobStatus.canceled) {
            reject(new JobCancelError());
          } else {
            reject(jobEnd);
          }
        },
      }),
    );
  });

const cancel = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  const state = getState();
  const { callbacksId } = getJobMonitorState(state);
  await JobMonitorCallbacksRegistry.get(callbacksId)?.onCancel?.();
  dispatch(close());
};

const close = () => (dispatch: AppDispatch, getState: AppGetState) => {
  const state = getState();
  const { callbacksId } = getJobMonitorState(state);
  const onClose = JobMonitorCallbacksRegistry.get(callbacksId)?.onClose;
  JobMonitorCallbacksRegistry.remove(callbacksId);
  onClose?.();
  dispatch(JobMonitorSliceActions.end());
};

export const JobMonitorActions = {
  start,
  startAsync,
  cancel,
  close,
};
