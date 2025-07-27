import { JobMessageOutType, JobStatus } from "@openforis/arena-core";
import { WebSocketService } from "service";

const JOB_MONITOR_START = "JOB_MONITOR_START";
const JOB_MONITOR_UPDATE = "JOB_MONITOR_UPDATE";
const JOB_MONITOR_END = "JOB_MONITOR_END";

const getJobMonitorState = (state) => state.jobMonitor;

const calculateProgressPercent = ({ jobSummary }) => {
  const { total, processed } = jobSummary;
  return total ? Math.floor((processed / total) * 100) : -1;
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

    const handleJobUpdate = ({
      jobSummary,
      ended,
      progressPercent,
      status,
    }) => {
      dispatch({
        type: JOB_MONITOR_UPDATE,
        payload: { progressPercent, status },
      });
      if (ended) {
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
      job.on(JobMessageOutType.summaryUpdate, (jobSummary) => {
        const { status } = jobSummary;
        const progressPercent = calculateProgressPercent({ jobSummary });
        const ended = [
          JobStatus.canceled,
          JobStatus.failed,
          JobStatus.succeeded,
        ].includes(status);
        handleJobUpdate({ jobSummary, ended, progressPercent, status });
      });
    } else {
      const ws = await WebSocketService.open();

      const notifyJobUpdate = (jobSummary) => {
        const { ended, progressPercent, status } = jobSummary;
        handleJobUpdate({ jobSummary, ended, progressPercent, status });
      };
      ws.on(WebSocketService.EVENTS.jobUpdate, notifyJobUpdate);
    }
  };

const startAsync = async ({ dispatch, ...otherParams }) =>
  new Promise((resolve, reject) => {
    dispatch(
      start({
        ...otherParams,
        onJobEnd: (jobEnd) => {
          if (jobEnd.status === JobStatus.succeeded) {
            resolve(jobEnd);
          } else {
            reject(jobEnd);
          }
        },
      })
    );
  });

const cancel = () => (dispatch, getState) => {
  const state = getState();
  const jobMonitorState = getJobMonitorState(state);
  const { onCancel } = jobMonitorState;
  onCancel?.();
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
