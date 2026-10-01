import { useEffect } from "react";

import { useIsNetworkConnected } from "hooks/useIsNetworkConnected";
import { useAppDispatch } from "state/storeHooks";

import { DeviceInfoActions } from "./actions";

export const useIsNetworkConnectedMonitor = () => {
  const dispatch = useAppDispatch();
  const isNetworkConnected = useIsNetworkConnected();

  useEffect(() => {
    dispatch(DeviceInfoActions.updateIsNetworkConnected(isNetworkConnected));
  }, [dispatch, isNetworkConnected]);
};
