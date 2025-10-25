import { useSelector } from "react-redux";

const selectSettings = (state: any) => state.settings;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useSelector(selectSettings),
};
