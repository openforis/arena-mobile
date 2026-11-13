import { SettingsObject } from "model/SettingsModel";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectSettings = (state: RootState): SettingsObject => state.settings;

// re-renders only when this setting changes (not on any settings change)
const useSetting = <K extends keyof SettingsObject>(
  key: K,
): SettingsObject[K] => useAppSelector((state) => selectSettings(state)[key]);

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useAppSelector(selectSettings),

  // single settings
  useAnimationsEnabled: () => useSetting("animationsEnabled"),
  useAutoSyncEnabled: () => useSetting("autoSyncEnabled"),
  useEmail: () => useSetting("email"),
  useFontScale: () => useSetting("fontScale"),
  useImageSizeLimit: () => useSetting("imageSizeLimit"),
  useImageSizeUnlimited: () => useSetting("imageSizeUnlimited"),
  useLocationAccuracyThreshold: () => useSetting("locationAccuracyThreshold"),
  useLocationAccuracyWatchTimeout: () =>
    useSetting("locationAccuracyWatchTimeout"),
  useLocationAveragingEnabled: () => useSetting("locationAveragingEnabled"),
  useLocationGpsLocked: () => useSetting("locationGpsLocked"),
  useMapLayer: () => useSetting("mapLayer"),
  useMapProvider: () => useSetting("mapProvider"),
  usePassword: () => useSetting("password"),
  usePreferredGpsSourceId: () => useSetting("preferredGpsSourceId"),
  useShowRecordCompletion: () => useSetting("showRecordCompletion"),
  useShowStatusBar: () => useSetting("showStatusBar"),
  useTheme: () => useSetting("theme"),
};
