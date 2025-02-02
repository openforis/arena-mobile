import { Environment } from "utils/Environment";
import { ThemesSettings } from "./Themes";
import { LanguagesSettings } from "./LanguageSettings";

const propertyType = {
  boolean: "boolean",
  numeric: "numeric",
  options: "options",
  dropdown: "dropdown",
  slider: "slider",
};

const keys = {
  language: "language",
  locationGpsLocked: "locationGpsLocked",
};

const properties = {
  [keys.language]: {
    type: propertyType.dropdown,
    labelKey: "settings:language.label",
    options: LanguagesSettings,
  },
  theme: {
    type: propertyType.dropdown,
    labelKey: "settings:theme.label",
    options: Object.values(ThemesSettings).map((theme) => ({
      key: theme,
      label: `settings:theme.${theme}`,
    })),
  },
  fullScreen: {
    type: propertyType.boolean,
    labelKey: "settings:fullScreen",
    isDisabled: () => Environment.isIOS,
  },
  keepScreenAwake: {
    type: propertyType.boolean,
    labelKey: "settings:keepScreenAwake",
  },
  animationsEnabled: {
    type: propertyType.boolean,
    labelKey: "settings:animationsEnabled",
  },
  showStatusBar: {
    type: propertyType.boolean,
    labelKey: "settings:showStatusBar",
  },
  fontScale: {
    type: propertyType.slider,
    labelKey: "settings:fontScale",
    minValue: 0.6,
    maxValue: 1.6,
    step: 0.2,
  },
  locationAccuracyThreshold: {
    type: propertyType.numeric,
    labelKey: "settings:locationAccuracyThreshold",
  },
  locationAccuracyWatchTimeout: {
    type: propertyType.slider,
    labelKey: "settings:locationAccuracyWatchTimeout",
    minValue: 30,
    maxValue: 300,
    step: 30,
  },
  [keys.locationGpsLocked]: {
    type: propertyType.boolean,
    labelKey: "settings:locationGpsLocked.label",
    descriptionKey: "settings:locationGpsLocked.description",
  },
};

export const SettingsModel = {
  keys,
  propertyType,
  properties,
};
