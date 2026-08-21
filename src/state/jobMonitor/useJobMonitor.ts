import { useCallback } from "react";
import { useSelector } from "react-redux";

import { useAppDispatch } from "state/store";
import { JobMonitorActions } from "./actions";
import { JobMonitorState } from "./types";

export const useJobMonitor = () => {
  const dispatch = useAppDispatch();

  const jobMonitorState: JobMonitorState = useSelector((state: any) => state.jobMonitor);

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
