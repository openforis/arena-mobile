import { useSelector } from "react-redux";
import * as Device from "expo-device";

import { ScreenOrientation } from "model";

const selectDeviceInfo = (state) => state.deviceInfo;

const selectIsDeviceType = (type) => (state) => {
  const info = selectDeviceInfo(state);
  const { deviceType } = info;
  return deviceType === type;
};

const selectIsPhone = selectIsDeviceType(Device.DeviceType.PHONE);
const selectIsTablet = selectIsDeviceType(Device.DeviceType.TABLET);
const selectBatteryLevel = (state) => selectDeviceInfo(state).batteryLevel;
const selectBatteryState = (state) => selectDeviceInfo(state).batteryState;
const selectOrientation = (state) => selectDeviceInfo(state).orientation;

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
