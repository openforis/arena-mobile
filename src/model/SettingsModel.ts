import { Environment } from "utils/Environment";
import { ThemesSettings } from "./Themes";
import { LanguageConstants, LanguagesSettings } from "./LanguageSettings";

enum PropertyType {
  boolean = "boolean",
  numeric = "numeric",
  options = "options",
  dropdown = "dropdown",
  slider = "slider",
}

type SettingsProperty = {
  type: PropertyType;
  options?: any[];
  isDisabled?: ({ settings }: any) => boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
};

const keys = {
  language: "language",
  locationGpsLocked: "locationGpsLocked",
};

const properties: Record<string, SettingsProperty> = {
  [keys.language]: {
    type: PropertyType.dropdown,
    options: LanguagesSettings,
  },
  theme: {
    type: PropertyType.dropdown,
    options: Object.values(ThemesSettings).map((theme) => ({
      key: theme,
      label: `settings:theme.${theme}`,
    })),
  },
  fullScreen: {
    type: PropertyType.boolean,
    isDisabled: () => Environment.isIOS,
  },
  keepScreenAwake: {
    type: PropertyType.boolean,
  },
  animationsEnabled: {
    type: PropertyType.boolean,
  },
  showStatusBar: {
    type: PropertyType.boolean,
  },
  fontScale: {
    type: PropertyType.slider,
    minValue: 0.6,
    maxValue: 1.6,
    step: 0.2,
  },
  locationAccuracyThreshold: {
    type: PropertyType.numeric,
  },
  locationAccuracyWatchTimeout: {
    type: PropertyType.slider,
    minValue: 30,
    maxValue: 300,
    step: 30,
  },
  [keys.locationGpsLocked]: {
    type: PropertyType.boolean,
  },
  // image resolution
  imageSizeUnlimited: {
    type: PropertyType.boolean,
  },
  imageSizeLimit: {
    type: PropertyType.slider,
    minValue: 0.5,
    maxValue: 10,
    step: 0.5,
    isDisabled: ({ settings }: any) => settings.imageSizeUnlimited,
  },
};

export type SettingsObject = {
  animationsEnabled: boolean;
  email?: string;
  fontScale: number;
  fullScreen: boolean;
  keepScreenAwake: boolean;
  imageSizeUnlimited: boolean;
  imageSizeLimit: number;
  language: LanguageConstants;
  locationAccuracyThreshold: number;
  locationAccuracyWatchTimeout: number;
  locationGpsLocked: boolean;
  password?: string;
  savePassword: boolean;
  serverUrlType: "default";
  serverUrl: string;
  showStatusBar: boolean;
  theme: ThemesSettings;
};

export const SettingsModel = {
  PropertyType,
  keys,
  properties,
};
