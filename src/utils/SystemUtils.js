import * as Application from "expo-application";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Localization from "expo-localization";
import * as ExpoScreenOrientation from "expo-screen-orientation";

import { Dates, FileNames, UUIDs } from "@openforis/arena-core";

import { ScreenOrientation } from "model";
import { Environment } from "./Environment";
import { Files } from "./Files";

const { nativeBuildVersion: buildNumber, nativeApplicationVersion: version } =
  Application;

const appId = "am";
const { isAndroid, isExpoGo, platform } = Environment;

let SystemNavigationBar;
if (!isExpoGo && isAndroid) {
  SystemNavigationBar = require("react-native-system-navigation-bar")?.default;
}

let Clipboard;
if (!isExpoGo) {
  Clipboard = require("@react-native-clipboard/clipboard")?.default;
}

const copyValueToClipboard = (value) => {
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

const getApplicationInfo = async () => {
  const lastUpdateTime = await getLastUpdateTime();
  return {
    buildNumber,
    version,
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

const setFullScreen = async (fullScreen) => {
  try {
    await SystemNavigationBar?.stickyImmersive(fullScreen);
  } catch (e) {
    // ignore it (not available)
  }
};

const setKeepScreenAwake = async (keepScreenAwake) => {
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

const addOrientationChangeListener = (handler) => {
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
};
