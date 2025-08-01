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
    onCancel = undefined,
    onClose = undefined,
    autoDismiss = false,
  }) =>
  async (dispatch) => {
    dispatch({
      type: JOB_MONITOR_START,
      payload: {
        jobUuid,
        job,
        titleKey,
        cancelButtonTextKey,
        closeButtonTextKey,
        messageKey,
        messageParams,
        onCancel,
        onClose,
        autoDismiss,
      },
    });

    const onJobUpdate = (jobSummary) => {
      const { status } = jobSummary;
      const progressPercent = calculateJobProgressPercent({ jobSummary });

      dispatch({
        type: JOB_MONITOR_UPDATE,
        payload: { progressPercent, status },
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

    if (job) {
      if (isJobStatusEnded(job.status)) {
        onJobUpdate(job.summary);
      } else {
        job.on(JobMessageOutType.summaryUpdate, onJobUpdate);
      }
    } else {
      const ws = await WebSocketService.open();
      ws.on(WebSocketService.EVENTS.jobUpdate, onJobUpdate);
    }
  };

const startAsync = async ({ dispatch, ...otherParams }) =>
  new Promise((resolve, reject) => {
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
  const { onCancel, job } = jobMonitorState;
  onCancel?.();
  if (job?.cancel) {
    // cancel local job
    await job.cancel();
  }
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
