import { useSelector } from "react-redux";

import { SettingsObject } from "model/SettingsModel";

const selectSettings = (state: any) => state.settings as SettingsObject;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useSelector(selectSettings),
};
