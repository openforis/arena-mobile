import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { useAppDispatch } from "state/storeHooks";

import { DeviceInfoActions } from "./actions";

// mounted once for the whole app: the store keeps the network state for every component and action
export const useIsNetworkConnectedMonitor = () => {
  const dispatch = useAppDispatch();

  useEffect(
    () =>
      NetInfo.addEventListener((netInfoState) => {
        dispatch(
          DeviceInfoActions.updateIsNetworkConnected(
            netInfoState.isConnected ?? false,
          ),
        );
      }),
    [dispatch],
  );
};
