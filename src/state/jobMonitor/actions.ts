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
  showUploadStats,
  status,
  processed,
  total,
  previousSample,
}: {
  showUploadStats: boolean;
  status: JobStatus;
  processed: number;
  total: number;
  previousSample: {
    processed: number;
    timestamp: number;
    speed: number;
  } | null;
}) => {
  if (!showUploadStats || status !== JobStatus.running) {
    return {
      previousSample,
      uploadSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const processedNumber = Number(processed);
  const totalNumber = Number(total);

  if (!Number.isFinite(processedNumber) || !Number.isFinite(totalNumber)) {
    return {
      previousSample,
      uploadSpeedBytesPerSec: null,
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
      uploadSpeedBytesPerSec: null,
      etaSeconds: null,
    };
  }

  const elapsedSeconds = Math.max((now - previousSample.timestamp) / 1000, 0.001);
  const processedDiff = Math.max(0, processedNumber - previousSample.processed);
  const instantSpeed = processedDiff / elapsedSeconds;

  const speed =
    processedDiff > 0
      ? previousSample.speed
        ? previousSample.speed * 0.7 + instantSpeed * 0.3
        : instantSpeed
      : previousSample.speed;

  const remainingBytes = Math.max(0, totalNumber - processedNumber);
  const etaSeconds = speed > 0 ? Math.ceil(remainingBytes / speed) : null;

  return {
    previousSample: {
      processed: processedNumber,
      timestamp: now,
      speed,
    },
    uploadSpeedBytesPerSec: speed > 0 ? speed : null,
    etaSeconds,
  };
};

const createOnJobUpdateCallback =
  ({
    dispatch,
    job,
    autoDismiss,
    onJobComplete,
    onJobEnd,
    showUploadStats = false,
  }: any): (jobSummary: JobSerialized<any>) => void => {
    let previousSample: {
      processed: number;
      timestamp: number;
      speed: number;
    } | null = null;

    return (jobSummary: JobSerialized<any>) => {
      const { status, errors, processed, total } = jobSummary;
      const progressPercent = calculateJobProgressPercent({ jobSummary });

      const uploadStats = buildUploadStats({
        showUploadStats,
        status,
        processed,
        total,
        previousSample,
      });
      previousSample = uploadStats.previousSample;

      dispatch({
        type: JOB_MONITOR_UPDATE,
        payload: {
          progressPercent,
          status,
          errors,
          uploadSpeedBytesPerSec: uploadStats.uploadSpeedBytesPerSec,
          etaSeconds: uploadStats.etaSeconds,
        },
      });
      if (isJobStatusEnded(status)) {
        if (!job) {
          // remote job
          WebSocketService.close();
        }
        if (status === JobStatus.succeeded) {
          if (autoDismiss) {
            dispatch(close());
          }
          onJobComplete?.(jobSummary);
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
  jobUuid?: string | null;
  job?: JobMobile<any> | null;
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
  showUploadStats?: boolean;
};

const start =
  ({
    // jobUuid must be provided when monitoring a remote job
    jobUuid = null,

    // job must be provided when monitoring a local job
    job = null,

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
    showUploadStats = false,
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
          showUploadStats,
          uploadSpeedBytesPerSec: null,
          etaSeconds: null,
        },
      });

      const onJobUpdate = createOnJobUpdateCallback({
        dispatch,
        job,
        autoDismiss,
        onJobComplete,
        onJobEnd,
        showUploadStats,
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
