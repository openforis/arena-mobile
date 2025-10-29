import * as Keychain from "react-native-keychain";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { API } from "./api";
import { ThemesSettings } from "model/Themes";
import { LanguageConstants } from "model/LanguageSettings";
import { AMConstants, SystemUtils } from "utils";

const defaultSettings = {
  animationsEnabled: true,
  fontScale: 1,
  fullScreen: false,
  imageSizeUnlimited: false,
  imageSizeLimit: 4, // MB
  language: LanguageConstants.system,
  locationAccuracyThreshold: 3,
  locationAccuracyWatchTimeout: 120,
  locationGpsLocked: false,
  serverUrlType: "default",
  serverUrl: AMConstants.defaultServerUrl,
  theme: ThemesSettings.auto,
};

let INSTANCE: any = null;

const systemSettingApplierByKey: Record<
  string,
  ({ key, value }: { key?: string; value: any }) => Promise<any>
> = {
  ["fullScreen"]: async ({ value }: any) => SystemUtils.setFullScreen(value),
  ["keepScreenAwake"]: async ({ value }: any) =>
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

const updateSetting = async ({ key, value }: any) => {
  const settingsPrev = await fetchSettings();
  const settingsNext = { ...settingsPrev, [key]: value };
  await saveSettings(settingsNext);
  await systemSettingApplierByKey[key]?.({ key, value });
  return settingsNext;
};

const saveSettings = async (settings: any) => {
  await AsyncStorageUtils.setItem(asyncStorageKeys.settings, settings);
  INSTANCE = settings;
};

const getCredentials = async (server: any) =>
  Keychain.getInternetCredentials(server);

const setCredentials = async (server: any, email: any, password: any) =>
  Keychain.setInternetCredentials(server, email, password);

const testServerUrl = async (serverUrl: any) => {
  try {
    return await API.test(serverUrl, "healthcheck");
  } catch (error) {
    return false;
  }
};

export const SettingsService = {
  fetchSettings,
  updateSetting,
  saveSettings,

  getCredentials,
  setCredentials,

  testServerUrl,
};
