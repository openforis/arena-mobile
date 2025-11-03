import { useCallback } from "react";
import { useSelector } from "react-redux";

import { JobMonitorActions } from "./actions";
import { useAppDispatch } from "state/store";

export const useJobMonitor = () => {
  const dispatch = useAppDispatch();

  const jobMonitorState = useSelector((state: any) => state.jobMonitor);

  const cancel = useCallback(() => {
    dispatch(JobMonitorActions.cancel());
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch(JobMonitorActions.close());
  }, [dispatch]);

  return {
    ...jobMonitorState,
    cancel,
    close,
  };
};
