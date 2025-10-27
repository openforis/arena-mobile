import {
  JobMessageOutType,
  JobStatus,
  JobSummary,
} from "@openforis/arena-core";
import { WebSocketService } from "service";

const JOB_MONITOR_START = "JOB_MONITOR_START";
const JOB_MONITOR_UPDATE = "JOB_MONITOR_UPDATE";
const JOB_MONITOR_END = "JOB_MONITOR_END";

const getJobMonitorState = (state: any) => state.jobMonitor;

const isJobStatusEnded = (status: any) =>
  [JobStatus.canceled, JobStatus.failed, JobStatus.succeeded].includes(status);

const calculateJobProgressPercent = ({ jobSummary }: any) => {
  const { total, processed, progressPercent } = jobSummary;
  return (
    progressPercent ?? (total ? Math.floor((processed / total) * 100) : -1)
  );
};

const createOnJobUpdateCallback =
  ({ dispatch, job, autoDismiss, onJobComplete, onJobEnd }: any) =>
  (jobSummary: any) => {
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

const createOnCancelCallback = ({ job, onCancelProp }: any) => {
  if (!job && !onCancelProp) return undefined;
  return async () => {
    await job?.cancel();
    onCancelProp?.();
  };
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
  }: any) =>
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

const startAsync = async ({
  dispatch,
  ...otherParams
}: any): Promise<JobSummary<any> | undefined> =>
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
        onJobEnd: (jobEnd: JobSummary<any>) => {
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
