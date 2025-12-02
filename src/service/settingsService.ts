import * as Keychain from "react-native-keychain";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { API } from "./api";
import { ThemesSettings } from "model/Themes";
import { LanguageConstants } from "model/LanguageSettings";
import { SettingKey } from "model/SettingsModel";
import { AMConstants, SystemUtils } from "utils";

const defaultSettings: Partial<SettingsObject> = {
  animationsEnabled: true,
  fontScale: 1,
  imageSizeUnlimited: false,
  imageSizeLimit: 4, // MB
  language: LanguageConstants.system,
  locationAccuracyThreshold: 3,
  locationAccuracyWatchTimeout: 120,
  locationAveragingEnabled: true,
  serverUrlType: "default",
  serverUrl: AMConstants.defaultServerUrl,
  theme: ThemesSettings.auto,
};

type SettingsObject = Record<SettingKey, any>;

let INSTANCE: SettingsObject | null = null;

interface SystemSettingApplier {
  ({ key, value }: { key?: SettingKey; value: any }): Promise<any>;
}

const systemSettingApplierByKey: Partial<
  Record<SettingKey, SystemSettingApplier>
> = {
  fullScreen: async ({ value }: any) => SystemUtils.setFullScreen(value),
  keepScreenAwake: async ({ value }: any) =>
    SystemUtils.setKeepScreenAwake(value),
};

const fetchSettings = async (): Promise<SettingsObject> => {
  if (!INSTANCE) {
    INSTANCE = {
      ...defaultSettings,
      ...(await AsyncStorageUtils.getItem(asyncStorageKeys.settings)),
    };
  }
  return INSTANCE!;
};

const updateSetting = async ({
  key,
  value,
}: {
  key: SettingKey;
  value: any;
}): Promise<SettingsObject> => {
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
