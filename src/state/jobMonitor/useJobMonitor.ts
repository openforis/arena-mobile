import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { JobMonitorActions } from "./actions";

export const useJobMonitor = () => {
  const dispatch = useDispatch();

  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  const jobMonitorState = useSelector((state) => state.jobMonitor);

  const cancel = useCallback(() => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
    dispatch(JobMonitorActions.cancel());
  }, [dispatch]);

  const close = useCallback(() => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
    dispatch(JobMonitorActions.close());
  }, [dispatch]);

  return {
    ...jobMonitorState,
    cancel,
    close,
  };
};
