import * as Location from "expo-location";

import { changeLanguage } from "localization";
import { CustomMapLayer, PdfMap, SettingsModel, SettingsObject } from "model";
import {
  CustomMapLayersService,
  PdfMapsService,
  SettingsService,
} from "service";
import { Permissions } from "utils";

import { ToastActions } from "../toast";
import type { AppDispatch } from "../store";

const SETTINGS_SET = "SETTINGS_SET";

const setSettings = (settings: any) => (dispatch: AppDispatch) => {
  dispatch({ type: SETTINGS_SET, settings });
};

const initSettings = () => async (dispatch: AppDispatch) => {
  const settings = await SettingsService.fetchSettings();
  dispatch(setSettings(settings));
};

const updateSetting =
  ({ key, value }: any) =>
  async (dispatch: AppDispatch) => {
    let canPersist = true;

    if (key === SettingsModel.SettingKey.locationGpsLocked) {
      if (value) {
        canPersist = await dispatch(startGpsLocking());
      } else {
        _stopGpsLocking();
      }
    } else if (key === SettingsModel.SettingKey.language) {
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

const updateSettings =
  (settings: SettingsObject) => async (dispatch: AppDispatch) => {
    const settingsUpdated = { ...settings };
    delete settingsUpdated["password"];
    await SettingsService.saveSettings(settingsUpdated);
    dispatch(setSettings(settingsUpdated));
  };

const saveCustomMapLayer =
  ({ layer, apiKey }: { layer: CustomMapLayer; apiKey: string }) =>
  async (dispatch: AppDispatch) => {
    const settingsUpdated = await CustomMapLayersService.saveLayer({
      layer,
      apiKey,
    });
    dispatch(setSettings(settingsUpdated));
  };

const deleteCustomMapLayer =
  (layerId: string) => async (dispatch: AppDispatch) => {
    const settingsUpdated = await CustomMapLayersService.deleteLayer(layerId);
    dispatch(setSettings(settingsUpdated));
  };

const updatePdfMap =
  ({
    mapId,
    changes,
  }: {
    mapId: string;
    changes: Partial<Pick<PdfMap, "name" | "visible" | "opacity">>;
  }) =>
  async (dispatch: AppDispatch) => {
    const settingsUpdated = await PdfMapsService.updateMap(mapId, changes);
    if (settingsUpdated) {
      dispatch(setSettings(settingsUpdated));
    }
  };

const deletePdfMap = (mapId: string) => async (dispatch: AppDispatch) => {
  const settingsUpdated = await PdfMapsService.deleteMap(mapId);
  dispatch(setSettings(settingsUpdated));
};

// one fix per second (GPS receivers' usual rate) is enough to keep the GPS locked
const gpsLockingTimeInterval = 1000;

let gpsLockingSubscription: Location.LocationSubscription | null = null;
// incremented on every start/stop: a start superseded while awaiting drops its watch
let gpsLockingRequestId = 0;

const _startGpsLocking = async () => {
  const requestId = ++gpsLockingRequestId;
  if (!(await Permissions.requestLocationForegroundPermission())) return false;

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 0,
      timeInterval: gpsLockingTimeInterval,
    },
    (_location) => {},
  );
  if (requestId !== gpsLockingRequestId) {
    subscription.remove();
    return true;
  }
  gpsLockingSubscription?.remove();
  gpsLockingSubscription = subscription;
  return true;
};

const startGpsLocking = () => async (dispatch: AppDispatch) => {
  const started = await _startGpsLocking();
  if (!started) {
    dispatch(ToastActions.show("settings:locationGpsLocked.error"));
  }
  return started;
};

const _stopGpsLocking = () => {
  gpsLockingRequestId++;
  gpsLockingSubscription?.remove();
  gpsLockingSubscription = null;
};

export const SettingsActions = {
  SETTINGS_SET,

  initSettings,
  updateSetting,
  updateSettings,
  saveCustomMapLayer,
  deleteCustomMapLayer,
  updatePdfMap,
  deletePdfMap,

  startGpsLocking,
};
