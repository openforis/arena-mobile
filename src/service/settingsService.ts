import * as Keychain from "react-native-keychain";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { API } from "./api";
import { ThemesSettings } from "model/Themes";
import { LanguageConstants } from "model/LanguageSettings";
import { SettingsObject } from "model/SettingsModel";
import { AMConstants, SystemUtils } from "utils";

const defaultSettings: SettingsObject = {
  animationsEnabled: true,
  fontScale: 1,
  fullScreen: false,
  keepScreenAwake: false,
  imageSizeUnlimited: false,
  imageSizeLimit: 4, // MB
  language: LanguageConstants.system,
  locationAccuracyThreshold: 3,
  locationAccuracyWatchTimeout: 120,
  locationGpsLocked: false,
  serverUrlType: "default",
  serverUrl: AMConstants.defaultServerUrl,
  showStatusBar: false,
  theme: ThemesSettings.auto,
};

let INSTANCE: SettingsObject | null = null;

const systemSettingApplierByKey: Record<
  string,
  ({ key, value }: { key?: string; value: any }) => Promise<any>
> = {
  ["fullScreen"]: async ({ value }: any) => SystemUtils.setFullScreen(value),
  ["keepScreenAwake"]: async ({ value }: any) =>
    SystemUtils.setKeepScreenAwake(value),
};

const fetchSettings = async (): Promise<SettingsObject> =>
  (INSTANCE ??= {
    ...defaultSettings,
    ...(await AsyncStorageUtils.getItem(asyncStorageKeys.settings)),
  });

const updateSetting = async ({ key, value }: any) => {
  const settingsPrev = await fetchSettings();
  const settingsNext = { ...settingsPrev, [key]: value };
  await saveSettings(settingsNext);
  await systemSettingApplierByKey[key]?.({ key, value });
  return settingsNext;
};

const saveSettings = async (settings: SettingsObject) => {
  await AsyncStorageUtils.setItem(asyncStorageKeys.settings, settings);
  INSTANCE = settings;
};

const getCredentials = async (server: any) =>
  Keychain.getInternetCredentials(server);

const setCredentials = async (server: any, email: any, password: any) =>
  Keychain.setInternetCredentials(server, email, password);

const testServerUrl = async (serverUrl: any) => {
  try {
    const testResult = await API.test({ serverUrl, uri: "healthcheck" });
    return testResult;
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
