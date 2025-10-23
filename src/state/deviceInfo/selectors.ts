import { useSelector } from "react-redux";
import * as Device from "expo-device";

import { ScreenOrientation } from "model";

const selectDeviceInfo = (state: any) => state.deviceInfo;

const selectIsDeviceType = (type: any) => (state: any) => {
  const info = selectDeviceInfo(state);
  const { deviceType } = info;
  return deviceType === type;
};

const selectIsPhone = selectIsDeviceType(Device.DeviceType.PHONE);
const selectIsTablet = selectIsDeviceType(Device.DeviceType.TABLET);
const selectBatteryLevel = (state: any) => selectDeviceInfo(state).batteryLevel;
const selectBatteryState = (state: any) => selectDeviceInfo(state).batteryState;
const selectOrientation = (state: any) => selectDeviceInfo(state).orientation;

export const DeviceInfoSelectors = {
  selectDeviceInfo,
  selectIsTablet,
  selectIsPhone,

  useDeviceInfo: () => useSelector(selectDeviceInfo),
  useIsTablet: () => useSelector(selectIsTablet),
  useIsPhone: () => useSelector(selectIsPhone),
  useBatteryLevel: () => useSelector(selectBatteryLevel),
  useBatteryState: () => useSelector(selectBatteryState),
  useOrientation: () => useSelector(selectOrientation),
  useOrientationIsLandscape: () =>
    useSelector((state) => {
      const orientation = selectOrientation(state);
      return ScreenOrientation.isLandscape(orientation);
    }),
};
