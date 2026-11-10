import { SettingsObject } from "model/SettingsModel";
import type { RootState } from "../store";
import { useAppSelector } from "../storeHooks";

const selectSettings = (state: RootState): SettingsObject => state.settings;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useAppSelector(selectSettings),
};
