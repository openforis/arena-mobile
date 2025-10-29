import { useEffect } from "react";

import { useIsNetworkConnected } from "hooks";
import { useAppDispatch } from "state/store";

import { DeviceInfoActions } from "./actions";

export const useIsNetworkConnectedMonitor = () => {
  const dispatch = useAppDispatch();
  const isNetworkConnected = useIsNetworkConnected();

  useEffect(() => {
    dispatch(DeviceInfoActions.updateIsNetworkConnected(isNetworkConnected));
  }, [dispatch, isNetworkConnected]);
};
