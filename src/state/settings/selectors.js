import { useSelector } from "react-redux";

const selectSettings = (state) => state.settings;

export const SettingsSelectors = {
  selectSettings,

  useSettings: () => useSelector(selectSettings),
};
