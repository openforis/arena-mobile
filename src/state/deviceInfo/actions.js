import * as Battery from "expo-battery";
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";

import { BatteryState } from "model";
import { Files, SystemUtils } from "utils";

import { DeviceInfoSelectors } from "./selectors";

const DEVICE_INFO_SET = "DEVICE_INFO_SET";
const DEVICE_INFO_UPDATE = "DEVICE_INFO_UPDATE";

const batteryStatusFromExpoBatteryState = {
  [Battery.BatteryState.CHARGING]: BatteryState.charging,
  [Battery.BatteryState.FULL]: BatteryState.full,
  [Battery.BatteryState.UNPLUGGED]: BatteryState.unplugged,
};

const setDeviceInfo = (deviceInfo) => (dispatch) => {
  dispatch({ type: DEVICE_INFO_SET, payload: deviceInfo });
};

const _getPowerState = async () => {
  const { batteryLevel, batteryState: expoBatteryState } =
    await Battery.getPowerStateAsync();
  return {
    batteryLevel,
    batteryState: batteryStatusFromExpoBatteryState[expoBatteryState],
  };
};

const initDeviceInfo = () => async (dispatch) => {
  const deviceType =
    (await Device.getDeviceTypeAsync()) || Device.DeviceType.PHONE;

  const { batteryLevel, batteryState } = await _getPowerState();

  const freeDiskStorage = await Files.getFreeDiskStorage();
  const { isConnected: isNetworkConnected } = await NetInfo.fetch();

  const orientation = await SystemUtils.getOrientation();

  SystemUtils.addOrientationChangeListener((orientation) => {
    dispatch(updateOrientation(orientation));
  });

  dispatch(
    setDeviceInfo({
      batteryLevel,
      batteryState,
      batteryLevelAtStartTime: batteryLevel,
      batteryLevelMeasureStartTime: Date.now(),
      deviceType,
      freeDiskStorage,
      isNetworkConnected,
      orientation,
    })
  );
};

const determineBatteryStateUpdateActionPayload = ({
  batteryLevel,
  batteryState,
  batteryStateChanged,
  batteryLevelMeasureStartTime,
  batteryLevelAtStartTime,
}) => {
  const payload = {};
  Object.assign(payload, {
    batteryLevel,
    batteryState,
    batteryTimeToDischarge: null,
    batteryTimeToFullCharge: null,
  });
  if (
    batteryStateChanged ||
    ![BatteryState.unplugged, BatteryState.charging].includes(batteryState)
  ) {
    Object.assign(payload, {
      batteryLevelMeasureStartTime: Date.now(),
      batteryLevelAtStartTime: batteryLevel,
    });
  } else {
    const elapsedTime = Date.now() - batteryLevelMeasureStartTime;
    const chargeDiff = batteryLevel - batteryLevelAtStartTime;
    const batteryLevelToReach =
      batteryState === BatteryState.unplugged ? batteryLevel : 1 - batteryLevel;
    const chargeTimeDiff = Math.ceil(
      (elapsedTime * batteryLevelToReach) / chargeDiff
    );
    if (batteryState === BatteryState.unplugged) {
      const timeLeft = -chargeTimeDiff;
      if (timeLeft >= 0) {
        payload.batteryTimeToDischarge = timeLeft;
      }
    } else if (batteryState === BatteryState.charging) {
      const timeLeft = chargeTimeDiff;
      if (timeLeft >= 0) {
        payload.batteryTimeToFullCharge = chargeTimeDiff;
      }
    }
  }
  return payload;
};

const startPowerStateMonitor = () => (dispatch) => {
  return Battery.addBatteryStateListener(() => {
    dispatch(updatePowerState());
  });
};

const updatePowerState = () => async (dispatch, getState) => {
  const state = getState();
  const {
    batteryLevel: batteryLevelPrev,
    batteryState: batteryStatePrev,
    batteryLevelMeasureStartTime,
    batteryLevelAtStartTime,
  } = DeviceInfoSelectors.selectDeviceInfo(state);

  const { batteryLevel, batteryState } = await _getPowerState();

  const batteryStateChanged = batteryState !== batteryStatePrev;
  const batteryLevelChanged = batteryLevel !== batteryLevelPrev;

  if (!batteryLevelChanged && !batteryStateChanged) {
    // do not update state
    return;
  }
  const payload = determineBatteryStateUpdateActionPayload({
    batteryLevel,
    batteryState,
    batteryStateChanged,
    batteryLevelMeasureStartTime,
    batteryLevelAtStartTime,
  });

  dispatch({ type: DEVICE_INFO_UPDATE, payload });
};

const updateFreeDiskStorage = () => async (dispatch, getState) => {
  const state = getState();
  const { freeDiskStorage: freeDiskStoragePrev } =
    DeviceInfoSelectors.selectDeviceInfo(state);

  const freeDiskStorage = await Files.getFreeDiskStorage();
  if (freeDiskStorage === freeDiskStoragePrev) return;

  dispatch({ type: DEVICE_INFO_UPDATE, payload: { freeDiskStorage } });
};

const updateIsNetworkConnected = (isNetworkConnected) => async (dispatch) => {
  dispatch({ type: DEVICE_INFO_UPDATE, payload: { isNetworkConnected } });
};

const updateOrientation = (orientation) => async (dispatch) => {
  dispatch({ type: DEVICE_INFO_UPDATE, payload: { orientation } });
};

export const DeviceInfoActions = {
  DEVICE_INFO_SET,
  DEVICE_INFO_UPDATE,

  setDeviceInfo,
  initDeviceInfo,
  startPowerStateMonitor,
  updatePowerState,
  updateFreeDiskStorage,
  updateIsNetworkConnected,
};
