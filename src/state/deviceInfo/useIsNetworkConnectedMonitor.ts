import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { DeviceInfoActions } from "./actions";
import { useIsNetworkConnected } from "hooks";

export const useIsNetworkConnectedMonitor = () => {
  const dispatch = useDispatch();
  const isNetworkConnected = useIsNetworkConnected();

  useEffect(() => {
    dispatch(DeviceInfoActions.updateIsNetworkConnected(isNetworkConnected));
  }, [dispatch, isNetworkConnected]);
};
