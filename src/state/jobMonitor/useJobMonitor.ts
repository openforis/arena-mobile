import { useCallback } from "react";
import { useSelector } from "react-redux";

import { useAppDispatch } from "state/store";
import { JobMonitorActions } from "./actions";
import { JobMonitorState } from "./types";

export const useJobMonitor = () => {
  const dispatch = useAppDispatch();

  const jobMonitorState: JobMonitorState = useSelector((state: any) => state.jobMonitor);

  const { progressPercent, progressRangeStart, progressRangeEnd } = jobMonitorState;
  // maps this job's own 0-100% progress into its slice of a larger chain's overall progress
  // (see JobMonitorState.progressRangeStart/End) - equal to progressPercent unchanged for a job
  // that isn't part of a chain (the default [0, 100] range). -1 (unknown/indeterminate) passes
  // through as-is.
  const combinedProgressPercent =
    typeof progressPercent === "number" && progressPercent >= 0
      ? progressRangeStart +
        (progressPercent / 100) * (progressRangeEnd - progressRangeStart)
      : progressPercent;

  const cancel = useCallback(() => {
    dispatch(JobMonitorActions.cancel());
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch(JobMonitorActions.close());
  }, [dispatch]);

  return {
    ...jobMonitorState,
    combinedProgressPercent,
    cancel,
    close,
  };
};
