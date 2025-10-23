import { Linking } from "react-native";
import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Localization from "expo-localization";
import * as ExpoScreenOrientation from "expo-screen-orientation";

import { AppInfo, Dates, FileNames, UUIDs } from "@openforis/arena-core";

import { ScreenOrientation } from "model";
import { Environment } from "./Environment";
import { Files } from "./Files";

export interface ArenaMobileAppInfo extends AppInfo {
  buildNumber?: string | null;
  lastUpdateTime?: string | null;
}

const { nativeBuildVersion: buildNumber, nativeApplicationVersion: version } =
  Application;

const appId = "am";
const { isAndroid, isExpoGo, platform } = Environment;

let SystemNavigationBar: any;
if (!isExpoGo && isAndroid) {
  SystemNavigationBar = require("react-native-system-navigation-bar")?.default;
}

let Clipboard: any;
if (!isExpoGo) {
  Clipboard = require("@react-native-clipboard/clipboard")?.default;
}

const copyValueToClipboard = (value: any) => {
  try {
    Clipboard?.setString(value);
    return true;
  } catch (_error) {
    // ignore it
    return false;
  }
};

const getLastUpdateTime = async () =>
  isAndroid ? Application.getLastUpdateTimeAsync() : null;

const getApplicationInfo = async (): Promise<ArenaMobileAppInfo> => {
  const lastUpdateTime = await getLastUpdateTime();
  return {
    appId,
    buildNumber,
    version: version ?? "0",
    lastUpdateTime: lastUpdateTime
      ? Dates.formatForStorage(lastUpdateTime)
      : null,
  };
};

const getRecordAppInfo = () => ({
  appId,
  version,
  platform,
});

const setFullScreen = async (fullScreen: any) => {
  try {
    await SystemNavigationBar?.stickyImmersive(fullScreen);
  } catch (e) {
    // ignore it (not available)
  }
};

const setKeepScreenAwake = async (keepScreenAwake: any) => {
  if (keepScreenAwake) {
    await activateKeepAwakeAsync();
  } else {
    deactivateKeepAwake();
  }
};

const getOrientation = async () => {
  const orientationExpo = await ExpoScreenOrientation.getOrientationAsync();
  return ScreenOrientation.fromExpoOrientation(orientationExpo);
};

const addOrientationChangeListener = (handler: any) => {
  ExpoScreenOrientation.addOrientationChangeListener((event) => {
    const orientationNext = event?.orientationInfo?.orientation;
    handler(ScreenOrientation.fromExpoOrientation(orientationNext));
  });
};

const lockOrientationToPortrait = async () => {
  await ExpoScreenOrientation.lockAsync(
    ExpoScreenOrientation.OrientationLock.PORTRAIT_UP
  );
};

const unlockOrientation = async () => {
  await ExpoScreenOrientation.unlockAsync();
};

const getLocale = () => Localization.getLocales()[0];

const getLanguageCode = () => {
  const locale = getLocale();
  return locale?.languageCode;
};

const cleanupTempFiles = async () => {
  // delete temp files in document and cache directories
  const directories = [Files.documentDirectory, Files.cacheDirectory];
  for (const directory of directories) {
    const documentFileNames = await Files.listDirectory(directory);
    for (const fileName of documentFileNames) {
      // file name could be a records export file (starting with recordsExport-)
      // or a temporary file (named using UUID)
      if (
        fileName.startsWith("recordsExport-") ||
        (["zip", "tmp"].includes(FileNames.getExtension(fileName)) &&
          UUIDs.isUuid(FileNames.getName(fileName)))
      ) {
        await Files.del(Files.path(directory, fileName), true);
      }
    }
  }
};

const openAppSettings = async () => {
  if (Environment.isIOS) {
    await Linking.openSettings();
  } else {
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: "package:" + Environment.pkg }
    );
  }
};

export const SystemUtils = {
  addOrientationChangeListener,
  copyValueToClipboard,
  getApplicationInfo,
  getOrientation,
  getRecordAppInfo,
  setFullScreen,
  setKeepScreenAwake,
  lockOrientationToPortrait,
  unlockOrientation,
  getLocale,
  getLanguageCode,
  cleanupTempFiles,
  openAppSettings,
};
