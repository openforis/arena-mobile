import * as Battery from "expo-battery";
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";

import { BatteryState } from "model";
import { Files, SystemUtils } from "utils";

import { DeviceInfoSelectors } from "./selectors";
import type { AppDispatch, AppGetState } from "../store";

const DEVICE_INFO_SET = "DEVICE_INFO_SET";
const DEVICE_INFO_UPDATE = "DEVICE_INFO_UPDATE";

const batteryStatusFromExpoBatteryState = {
  [Battery.BatteryState.CHARGING]: BatteryState.charging,
  [Battery.BatteryState.FULL]: BatteryState.full,
  [Battery.BatteryState.UNPLUGGED]: BatteryState.unplugged,
  [Battery.BatteryState.UNKNOWN]: BatteryState.unknown,
  [Battery.BatteryState.NOT_CHARGING]: BatteryState.full,
};

// initDeviceInfo can run more than once (e.g. app initialization retried): keep a single listener
let orientationChangeSubscription: { remove: () => void } | null = null;

const setDeviceInfo = (deviceInfo: any) => (dispatch: AppDispatch) => {
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

const initDeviceInfo = () => async (dispatch: AppDispatch) => {
  // independent native calls: run in parallel (this is part of the app startup)
  const [
    deviceTypeFetched,
    { batteryLevel, batteryState },
    freeDiskStorage,
    { isConnected: isNetworkConnected },
    orientation,
  ] = await Promise.all([
    Device.getDeviceTypeAsync(),
    _getPowerState(),
    Files.getFreeDiskStorage(),
    NetInfo.fetch(),
    SystemUtils.getOrientation(),
  ]);
  const deviceType = deviceTypeFetched || Device.DeviceType.PHONE;

  orientationChangeSubscription?.remove();
  orientationChangeSubscription = SystemUtils.addOrientationChangeListener(
    (orientation: any) => {
      dispatch(updateOrientation(orientation));
    },
  );

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
    }),
  );
};

const determineBatteryStateUpdateActionPayload = ({
  batteryLevel,
  batteryState,
  batteryStateChanged,
  batteryLevelMeasureStartTime,
  batteryLevelAtStartTime,
}: any) => {
  const payload: any = {};
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
      (elapsedTime * batteryLevelToReach) / chargeDiff,
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

const updatePowerState =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
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

const updateFreeDiskStorage =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { freeDiskStorage: freeDiskStoragePrev } =
      DeviceInfoSelectors.selectDeviceInfo(state);

    const freeDiskStorage = await Files.getFreeDiskStorage();
    if (freeDiskStorage === freeDiskStoragePrev) return;

    dispatch({ type: DEVICE_INFO_UPDATE, payload: { freeDiskStorage } });
  };

const updateIsNetworkConnected =
  (isNetworkConnected: boolean) =>
  (dispatch: AppDispatch, getState: AppGetState) => {
    // NetInfo notifies also other changes (e.g. wifi strength): skip no-op store updates
    if (getState().deviceInfo.isNetworkConnected === isNetworkConnected) return;
    dispatch({ type: DEVICE_INFO_UPDATE, payload: { isNetworkConnected } });
  };

const updateOrientation = (orientation: any) => (dispatch: AppDispatch) => {
  dispatch({ type: DEVICE_INFO_UPDATE, payload: { orientation } });
};

export const DeviceInfoActions = {
  DEVICE_INFO_SET,
  DEVICE_INFO_UPDATE,

  setDeviceInfo,
  initDeviceInfo,
  updatePowerState,
  updateFreeDiskStorage,
  updateIsNetworkConnected,
};
