import * as Keychain from "react-native-keychain";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { API } from "./api";
import { LanguageConstants, ThemesSettings } from "model";
import { SystemUtils } from "utils";

const defaultServerUrl = "https://www.openforis-arena.org";

const defaultSettings = {
  animationsEnabled: true,
  fontScale: 1,
  fullScreen: false,
  language: LanguageConstants.system,
  locationAccuracyThreshold: 3,
  locationAccuracyWatchTimeout: 120,
  locationGpsLocked: false,
  serverUrlType: "default",
  serverUrl: defaultServerUrl,
  theme: ThemesSettings.auto,
};

let INSTANCE = null;

const systemSettingApplierByKey = {
  ["fullScreen"]: async ({ value }) => SystemUtils.setFullScreen(value),
  ["keepScreenAwake"]: async ({ value }) =>
    SystemUtils.setKeepScreenAwake(value),
};

const fetchSettings = async () => {
  if (!INSTANCE) {
    INSTANCE = {
      ...defaultSettings,
      ...(await AsyncStorageUtils.getItem(asyncStorageKeys.settings)),
    };
  }
  return INSTANCE;
};

const updateSetting = async ({ key, value }) => {
  const settingsPrev = await fetchSettings();
  const settingsNext = { ...settingsPrev, [key]: value };
  await saveSettings(settingsNext);
  await systemSettingApplierByKey[key]?.({ key, value });
  return settingsNext;
};

const saveSettings = async (settings) => {
  await AsyncStorageUtils.setItem(asyncStorageKeys.settings, settings);
  INSTANCE = settings;
};

const getCredentials = async (server) =>
  Keychain.getInternetCredentials(server);

const setCredentials = async (server, email, password) =>
  Keychain.setInternetCredentials(server, email, password);

const testServerUrl = async (serverUrl) => {
  try {
    return await API.test(serverUrl, "healthcheck");
  } catch (error) {
    return false;
  }
};

export const SettingsService = {
  defaultServerUrl,
  fetchSettings,
  updateSetting,
  saveSettings,

  getCredentials,
  setCredentials,

  testServerUrl,
};
