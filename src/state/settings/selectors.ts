import { SettingsObject } from "model/SettingsModel";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectSettings = (state: RootState): SettingsObject => state.settings;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useAppSelector(selectSettings),
  // re-renders only when this setting changes (not on any settings change)
  useSetting: <K extends keyof SettingsObject>(key: K): SettingsObject[K] =>
    useAppSelector((state) => selectSettings(state)[key]),
};
