import { DeviceInfoSelectors } from "state/deviceInfo/selectors";

// kept up to date by useIsNetworkConnectedMonitor (a single NetInfo listener for the whole app)
export const useIsNetworkConnected = (): boolean =>
  DeviceInfoSelectors.useIsNetworkConnected();
