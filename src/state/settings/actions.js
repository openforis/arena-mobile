import * as Location from "expo-location";

import { changeLanguage } from "localization";
import { SettingsModel } from "model";
import { SettingsService } from "service";
import { Permissions } from "utils";

import { ToastActions } from "../toast";

const SETTINGS_SET = "SETTINGS_SET";

const setSettings = (settings) => (dispatch) => {
  dispatch({ type: SETTINGS_SET, settings });
};

const initSettings = () => async (dispatch) => {
  const settings = await SettingsService.fetchSettings();
  dispatch(setSettings(settings));
};

const updateSetting =
  ({ key, value }) =>
  async (dispatch) => {
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

const updateSettings = (settings) => async (dispatch) => {
  await SettingsService.saveSettings(settings);
  dispatch(setSettings(settings));
};

let gpsLockingSubscription = null;

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

const startGpsLocking = () => async (dispatch) => {
  const started = await _startGpsLocking();
  if (!started) {
    dispatch(ToastActions.show("settings:locationGpsLocked.error"));
  }
  return started;
};

const _stopGpsLocking = () => {
  gpsLockingSubscription?.remove();
};

const stopGpsLocking = () => (_dispatch) => {
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
