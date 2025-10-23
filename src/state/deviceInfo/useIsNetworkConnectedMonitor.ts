import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { DeviceInfoActions } from "./actions";
import { useIsNetworkConnected } from "hooks";

export const useIsNetworkConnectedMonitor = () => {
  const dispatch = useDispatch();
  const isNetworkConnected = useIsNetworkConnected();

  useEffect(() => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
    dispatch(DeviceInfoActions.updateIsNetworkConnected(isNetworkConnected));
  }, [dispatch, isNetworkConnected]);
};
