import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { JobMonitorActions } from "./actions";

export const useJobMonitor = () => {
  const dispatch = useDispatch();

  const jobMonitorState = useSelector((state: any) => state.jobMonitor);

  const cancel = useCallback(() => {
    dispatch(JobMonitorActions.cancel() as never);
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch(JobMonitorActions.close() as never);
  }, [dispatch]);

  return {
    ...jobMonitorState,
    cancel,
    close,
  };
};
