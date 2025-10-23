// @ts-expect-error TS(2307): Cannot find module 'utils/Environment' or its corr... Remove this comment to see the full error message
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
    options: LanguagesSettings,
  },
  theme: {
    type: propertyType.dropdown,
    options: Object.values(ThemesSettings).map((theme) => ({
      key: theme,
      label: `settings:theme.${theme}`,
    })),
  },
  fullScreen: {
    type: propertyType.boolean,
    isDisabled: () => Environment.isIOS,
  },
  keepScreenAwake: {
    type: propertyType.boolean,
  },
  animationsEnabled: {
    type: propertyType.boolean,
  },
  showStatusBar: {
    type: propertyType.boolean,
  },
  fontScale: {
    type: propertyType.slider,
    minValue: 0.6,
    maxValue: 1.6,
    step: 0.2,
  },
  locationAccuracyThreshold: {
    type: propertyType.numeric,
  },
  locationAccuracyWatchTimeout: {
    type: propertyType.slider,
    minValue: 30,
    maxValue: 300,
    step: 30,
  },
  [keys.locationGpsLocked]: {
    type: propertyType.boolean,
  },
  // image resolution
  imageSizeUnlimited: {
    type: propertyType.boolean,
  },
  imageSizeLimit: {
    type: propertyType.slider,
    minValue: 0.5,
    maxValue: 10,
    step: 0.5,
    isDisabled: ({
      settings
    }: any) => settings.imageSizeUnlimited,
  },
};

export const SettingsModel = {
  keys,
  propertyType,
  properties,
};
