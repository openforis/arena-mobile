import { useSelector } from "react-redux";

import { SettingsObject } from "model/SettingsModel";

const selectSettings = (state: any): SettingsObject => state.settings;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useSelector(selectSettings),
};
