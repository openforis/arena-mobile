import * as Location from "expo-location";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { changeLanguage } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { SettingsModel } from "model";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { SettingsService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Permissions } from "utils";

import { ToastActions } from "../toast";

const SETTINGS_SET = "SETTINGS_SET";

const setSettings = (settings: any) => (dispatch: any) => {
  dispatch({ type: SETTINGS_SET, settings });
};

const initSettings = () => async (dispatch: any) => {
  const settings = await SettingsService.fetchSettings();
  dispatch(setSettings(settings));
};

const updateSetting =
  ({
    key,
    value
  }: any) =>
  async (dispatch: any) => {
    let canPersist = true;

    if (key === SettingsModel.keys.locationGpsLocked) {
      if (value) {
        canPersist = await dispatch(startGpsLocking());
      } else {
        _stopGpsLocking();
      }
    } else if (key === SettingsModel.keys.language) {
      changeLanguage(value);
    }
    if (canPersist) {
      const settingsUpdated = await SettingsService.updateSetting({
        key,
        value,
      });
      dispatch(setSettings(settingsUpdated));
    }
  };

const updateSettings = (settings: any) => async (dispatch: any) => {
  await SettingsService.saveSettings(settings);
  dispatch(setSettings(settings));
};

let gpsLockingSubscription: any = null;

const _startGpsLocking = async () => {
  if (!(await Permissions.requestLocationForegroundPermission())) return false;

  gpsLockingSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 0,
      timeInterval: 10,
    },
    (_location) => {}
  );
  return true;
};

const startGpsLocking = () => async (dispatch: any) => {
  const started = await _startGpsLocking();
  if (!started) {
    dispatch(ToastActions.show("settings:locationGpsLocked.error"));
  }
  return started;
};

const _stopGpsLocking = () => {
  gpsLockingSubscription?.remove();
};

const stopGpsLocking = () => (_dispatch: any) => {
  return _stopGpsLocking();
};

export const SettingsActions = {
  SETTINGS_SET,

  initSettings,
  updateSetting,
  updateSettings,

  startGpsLocking,
  stopGpsLocking,
};
