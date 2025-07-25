import { JobMessageOutType, JobStatus } from "@openforis/arena-core";
import { WebSocketService } from "service";

const JOB_MONITOR_START = "JOB_MONITOR_START";
const JOB_MONITOR_UPDATE = "JOB_MONITOR_UPDATE";
const JOB_MONITOR_END = "JOB_MONITOR_END";

const getJobMonitorState = (state) => state.jobMonitor;

const start =
  ({
    jobUuid,
    titleKey = "common:processing",
    cancelButtonTextKey = "common:cancel",
    closeButtonTextKey = "common:close",
    messageKey,
    messageParams = {},
    onJobComplete = undefined,
    onJobEnd = undefined,
    onCancel = undefined,
    onClose = undefined,
    remote = true,
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
        remote,
        autoDismiss,
      },
    });

    const handleJobUpdate = ({ job, ended, progressPercent, status }) => {
      dispatch({
        type: JOB_MONITOR_UPDATE,
        payload: { progressPercent, status },
      });
      if (ended) {
        if (remote) {
          WebSocketService.close();
        }
        if (onJobComplete && status === JobStatus.succeeded) {
          onJobComplete(job);
        }
        onJobEnd?.(job);
        if (autoDismiss) {
          dispatch(close())
        }
      }
    };

    if (remote) {
      const ws = await WebSocketService.open();

      const notifyJobUpdate = (job) => {
        const { ended, progressPercent, status } = job;
        handleJobUpdate({ job, ended, progressPercent, status });
      };
      ws.on(WebSocketService.EVENTS.jobUpdate, notifyJobUpdate);
    } else {
      job.on(JobMessageOutType.summaryUpdate, (jobSummary) => {
        const { processed, status, total } = jobSummary;
        const progressPercent = total
          ? Math.floor((processed / total) * 100)
          : -1;
        const ended = [
          JobStatus.canceled,
          JobStatus.failed,
          JobStatus.succeeded,
        ].includes(status);
        handleJobUpdate({ job: jobSummary, ended, progressPercent, status });
      });
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
