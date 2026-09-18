import { JobSerialized, JobStatus } from "@openforis/arena-core";

import { JobCancelError, JobMobile } from "model";
import { WebSocketService } from "service";

const JOB_MONITOR_START = "JOB_MONITOR_START";
const JOB_MONITOR_UPDATE = "JOB_MONITOR_UPDATE";
const JOB_MONITOR_END = "JOB_MONITOR_END";

const getJobMonitorState = (state: any) => state.jobMonitor;

const isJobStatusEnded = (status: any) =>
  [JobStatus.canceled, JobStatus.failed, JobStatus.succeeded].includes(status);

const calculateJobProgressPercent = ({
  jobSummary,
}: {
  jobSummary: JobSerialized<any>;
}) => {
  const { total, processed, progressPercent } = jobSummary;
  if (progressPercent != null) {
    return progressPercent;
  }

  const totalNumber = Number(total);
  const processedNumber = Number(processed);
  if (!Number.isFinite(totalNumber) || totalNumber <= 0 || !Number.isFinite(processedNumber)) {
    return -1;
  }
  return Math.floor((processedNumber / totalNumber) * 100);
};

const buildUploadStats = ({
  showTransferStats,
  status,
  processed,
  total,
  previousSample,
}: {
  showTransferStats: boolean;
  status: JobStatus;
  processed: number;
  total: number;
  previousSample: {
    processed: number;
    timestamp: number;
    speed: number;
  } | null;
}) => {
  if (!showTransferStats || status !== JobStatus.running) {
    return {
      previousSample,
      transferTotalBytes: null,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const processedNumber = Number(processed);
  const totalNumber = Number(total);

  if (!Number.isFinite(processedNumber) || !Number.isFinite(totalNumber)) {
    return {
      previousSample,
      transferTotalBytes: null,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const now = Date.now();

  if (!previousSample) {
    return {
      previousSample: {
        processed: processedNumber,
        timestamp: now,
        speed: 0,
      },
      transferTotalBytes: totalNumber,
      transferSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const elapsedSeconds = Math.max((now - previousSample.timestamp) / 1000, 0.001);
  const processedDiff = Math.max(0, processedNumber - previousSample.processed);
  const instantSpeed = processedDiff / elapsedSeconds;

  let speed = previousSample.speed;
  if (processedDiff > 0) {
    if (previousSample.speed > 0) {
      speed = previousSample.speed * 0.7 + instantSpeed * 0.3;
    } else {
      speed = instantSpeed;
    }
  }

  const remainingBytes = Math.max(0, totalNumber - processedNumber);
  const etaSeconds = speed > 0 ? Math.ceil(remainingBytes / speed) : null;

  return {
    previousSample: {
      processed: processedNumber,
      timestamp: now,
      speed,
    },
    transferTotalBytes: totalNumber,
    transferSpeedBytesPerSec: speed > 0 ? speed : null,
    etaSeconds,
  };
};

type InnerJobUiConfig = {
  titleKey: string;
  showTransferStats?: boolean;
};

// picks per-phase title/transfer-stats config for a job composed of several inner jobs (e.g.
// RecordsUploadAndProcessJob's upload -> server-side processing), keyed by the current inner
// job's own "type" (its class name - see JobBase's `type` field). Without this, a composite
// job's dialog would be stuck on whatever titleKey/showTransferStats were passed once at
// JobMonitorActions.start, even as it moves through phases that need different ones (e.g.
// transfer stats only make sense while the upload phase, not the server-side one, is current)
const resolveInnerJobUi = ({
  jobSummary,
  innerJobUiConfigByType,
}: {
  jobSummary: JobSerialized<any>;
  innerJobUiConfigByType?: Record<string, InnerJobUiConfig>;
}): { config: InnerJobUiConfig; currentInnerJobSummary: JobSerialized<any> } | null => {
  if (!innerJobUiConfigByType) return null;
  const { innerJobs, currentInnerJobIndex } = jobSummary as any;
  const currentInnerJobSummary = innerJobs?.[currentInnerJobIndex];
  const config = currentInnerJobSummary && innerJobUiConfigByType[currentInnerJobSummary.type];
  return config ? { config, currentInnerJobSummary } : null;
};

const createOnJobUpdateCallback =
  ({
    dispatch,
    job,
    autoDismiss,
    onJobComplete,
    onJobEnd,
    showTransferStats = false,
    innerJobUiConfigByType,
    silent = false,
  }: any): (jobSummary: JobSerialized<any>) => void => {
    let previousSample: {
      processed: number;
      timestamp: number;
      speed: number;
    } | null = null;

    return (jobSummary: JobSerialized<any>) => {
      const { status, errors, processed, total } = jobSummary;
      const progressPercent = calculateJobProgressPercent({ jobSummary });

      const innerJobUi = resolveInnerJobUi({ jobSummary, innerJobUiConfigByType });
      const currentShowTransferStats = innerJobUi
        ? !!innerJobUi.config.showTransferStats
        : showTransferStats;
      // a composite job's own processed/total just count finished inner jobs (e.g. 1 of 2), not
      // bytes - use the current inner job's own numbers for transfer stats instead
      const statsSource = innerJobUi?.currentInnerJobSummary ?? { processed, total };

      const uploadStats = buildUploadStats({
        showTransferStats: currentShowTransferStats,
        status,
        processed: statsSource.processed,
        total: statsSource.total,
        previousSample,
      });
      previousSample = uploadStats.previousSample;

      dispatch({
        type: JOB_MONITOR_UPDATE,
        payload: {
          progressPercent,
          status,
          errors,
          ...(innerJobUi
            ? { titleKey: innerJobUi.config.titleKey, showTransferStats: currentShowTransferStats }
            : {}),
          transferTotalBytes: uploadStats.transferTotalBytes,
          transferSpeedBytesPerSec: uploadStats.transferSpeedBytesPerSec,
          etaSeconds: uploadStats.etaSeconds,
        },
      });
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

const createOnCancelCallback = ({ job, onCancelProp }: any) => {
  if (!job && !onCancelProp) return undefined;
  return async () => {
    await job?.cancel();
    onCancelProp?.();
  };
};

type JobStartParams = {
  // job must be provided when monitoring a local job
  job?: JobMobile<any> | null;
  // jobUuid must be provided when monitoring a remote-only job (no local job instance) - see
  // actionsRecordsImport.ts's fetchRecordsFromServer for the one caller that needs this
  jobUuid?: string | null;
  titleKey?: string;
  cancelButtonTextKey?: string;
  closeButtonTextKey?: string;
  messageKey?: string;
  messageParams?: any;
  onJobComplete?: (jobSummary: JobSerialized<any>) => void;
  onJobEnd?: (jobSummary: JobSerialized<any>) => void;
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
  ({
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
  }: JobStartParams) =>
    async (dispatch: any) => {
      dispatch({
        type: JOB_MONITOR_START,
        payload: {
          jobUuid,
          titleKey,
          cancelButtonTextKey,
          closeButtonTextKey,
          messageKey,
          messageParams,
          onCancel: createOnCancelCallback({ job, onCancelProp }),
          onClose,
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
        },
      });

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
          onJobUpdate(job.toJSON());
        } else {
          job.onEvent(() => onJobUpdate(job.toJSON()));
        }
      } else {
        // remote job; open Web Socket and listen to job update events
        const ws = await WebSocketService.open();
        ws.on(WebSocketService.EVENTS.jobUpdate, onJobUpdate);
      }
    };

const startAsync = async ({
  dispatch,
  ...otherParams
}: JobStartParams & { dispatch: any }): Promise<JobSerialized<any> | undefined> =>
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
        onJobEnd: (jobEnd: JobSerialized<any>) => {
          const { status } = jobEnd;
          if (status === JobStatus.succeeded) {
            resolve(jobEnd);
          } else if (status === JobStatus.canceled) {
            reject(new JobCancelError());
          } else {
            reject(jobEnd);
          }
        },
      })
    );
  });

const cancel = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const jobMonitorState = getJobMonitorState(state);
  const { onCancel } = jobMonitorState;
  await onCancel?.();
  dispatch(close());
};

const close = () => (dispatch: any, getState: any) => {
  const state = getState();
  const jobMonitorState = getJobMonitorState(state);
  const { onClose } = jobMonitorState;
  onClose?.();
  dispatch({ type: JOB_MONITOR_END });
};

export const JobMonitorActions = {
  JOB_MONITOR_START,
  JOB_MONITOR_UPDATE,
  JOB_MONITOR_END,

  start,
  startAsync,
  cancel,
  close,
};
