import * as Device from "expo-device";

import { ScreenOrientation } from "model";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectDeviceInfo = (state: RootState) => state.deviceInfo;

const selectIsDeviceType = (type: any) => (state: RootState) => {
  const info = selectDeviceInfo(state);
  const { deviceType } = info;
  return deviceType === type;
};

const selectIsPhone = selectIsDeviceType(Device.DeviceType.PHONE);
const selectIsTablet = selectIsDeviceType(Device.DeviceType.TABLET);
const selectOrientation = (state: RootState) =>
  selectDeviceInfo(state).orientation;

const selectIsNetworkConnected = (state: RootState): boolean =>
  !!selectDeviceInfo(state).isNetworkConnected;

export const DeviceInfoSelectors = {
  selectDeviceInfo,
  selectIsNetworkConnected,
  selectIsTablet,
  selectIsPhone,

  useDeviceInfo: () => useAppSelector(selectDeviceInfo),
  useIsNetworkConnected: () => useAppSelector(selectIsNetworkConnected),
  useIsTablet: () => useAppSelector(selectIsTablet),
  useIsPhone: () => useAppSelector(selectIsPhone),
  useOrientation: () => useAppSelector(selectOrientation),
  useOrientationIsLandscape: () =>
    useAppSelector((state) => {
      const orientation = selectOrientation(state);
      return ScreenOrientation.isLandscape(orientation);
    }),
};
