import { JobMessageOutType, JobStatus } from "@openforis/arena-core";
import { WebSocketService } from "service";

const JOB_MONITOR_START = "JOB_MONITOR_START";
const JOB_MONITOR_UPDATE = "JOB_MONITOR_UPDATE";
const JOB_MONITOR_END = "JOB_MONITOR_END";

const getJobMonitorState = (state) => state.jobMonitor;

const isJobStatusEnded = (status) =>
  [JobStatus.canceled, JobStatus.failed, JobStatus.succeeded].includes(status);

const calculateJobProgressPercent = ({ jobSummary }) => {
  const { total, processed, progressPercent } = jobSummary;
  return (
    progressPercent ?? (total ? Math.floor((processed / total) * 100) : -1)
  );
};

const createOnJobUpdateCallback =
  ({ dispatch, job, autoDismiss, onJobComplete, onJobEnd }) =>
  (jobSummary) => {
    const { status, errors } = jobSummary;
    const progressPercent = calculateJobProgressPercent({ jobSummary });

    dispatch({
      type: JOB_MONITOR_UPDATE,
      payload: { progressPercent, status, errors },
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

const createOnCancelCallback = ({ job, onCancelProp }) => {
  if (!job && !onCancelProp) return undefined;
  return async () => {
    await job?.cancel();
    onCancelProp?.();
  };
};

const start =
  ({
    jobUuid = null, // jobUuid must be provided when monitoring a remote job
    job = null, // job must be provided when monitoring a local job
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
  }) =>
  async (dispatch) => {
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
      },
    });

    const onJobUpdate = createOnJobUpdateCallback({
      dispatch,
      job,
      autoDismiss,
      onJobComplete,
      onJobEnd,
    });

    if (job) {
      // local job: listen to job update events
      if (isJobStatusEnded(job.status)) {
        onJobUpdate(job.summary);
      } else {
        job.on(JobMessageOutType.summaryUpdate, onJobUpdate);
      }
    } else {
      // remote job; open Web Socket and listen to job update events
      const ws = await WebSocketService.open();
      ws.on(WebSocketService.EVENTS.jobUpdate, onJobUpdate);
    }
  };

const startAsync = async ({ dispatch, ...otherParams }) =>
  new Promise((resolve, reject) => {
    const { job } = otherParams;
    if (job) {
      job.start().catch((error) => {
        reject(error);
      });
    }
    dispatch(
      start({
        ...otherParams,
        onJobEnd: (jobEnd) => {
          const { status } = jobEnd;
          if (status === JobStatus.succeeded) {
            resolve(jobEnd);
          } else if (status === JobStatus.canceled) {
            reject();
          } else {
            reject(jobEnd);
          }
        },
      })
    );
  });

const cancel = () => async (dispatch, getState) => {
  const state = getState();
  const jobMonitorState = getJobMonitorState(state);
  const { onCancel } = jobMonitorState;
  await onCancel?.();
  dispatch(close());
};

const close = () => (dispatch, getState) => {
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
