import * as Keychain from "react-native-keychain";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { API } from "./api";
// @ts-expect-error TS(2307): Cannot find module 'model/Themes' or its correspon... Remove this comment to see the full error message
import { ThemesSettings } from "model/Themes";
// @ts-expect-error TS(2307): Cannot find module 'model/LanguageSettings' or its... Remove this comment to see the full error message
import { LanguageConstants } from "model/LanguageSettings";
// @ts-expect-error TS(2307): Cannot find module 'utils/SystemUtils' or its corr... Remove this comment to see the full error message
import { SystemUtils } from "utils/SystemUtils";

const defaultServerUrl = "https://www.openforis-arena.org";

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
  serverUrl: defaultServerUrl,
  theme: ThemesSettings.auto,
};

let INSTANCE: any = null;

const systemSettingApplierByKey = {
  ["fullScreen"]: async ({
    value
  }: any) => SystemUtils.setFullScreen(value),
  ["keepScreenAwake"]: async ({
    value
  }: any) =>
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

const updateSetting = async ({
  key,
  value
}: any) => {
  const settingsPrev = await fetchSettings();
  const settingsNext = { ...settingsPrev, [key]: value };
  await saveSettings(settingsNext);
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  await systemSettingApplierByKey[key]?.({ key, value });
  return settingsNext;
};

const saveSettings = async (settings: any) => {
  await AsyncStorageUtils.setItem(asyncStorageKeys.settings, settings);
  INSTANCE = settings;
};

const getCredentials = async (server: any) => Keychain.getInternetCredentials(server);

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
  defaultServerUrl,
  fetchSettings,
  updateSetting,
  saveSettings,

  getCredentials,
  setCredentials,

  testServerUrl,
};
