import { Environment } from "utils/Environment";
import { GpsSourceSetting } from "./GpsSourceSettings";
import { ThemesSettings } from "./Themes";
import { LanguageConstants, LanguagesSettings } from "./LanguageSettings";

enum PropertyType {
  boolean = "boolean",
  numeric = "numeric",
  options = "options",
  dropdown = "dropdown",
  slider = "slider",
}

export enum SettingGroup {
  appearance = "appearance",
  dataEntry = "dataEntry",
  location = "location",
  images = "images",
}

type SettingsProperty = {
  type: PropertyType;
  group: SettingGroup;
  options?: any[];
  isDisabled?: ({ settings }: any) => boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
};

export enum SettingKey {
  animationsEnabled = "animationsEnabled",
  fontScale = "fontScale",
  fullScreen = "fullScreen",
  imageSizeUnlimited = "imageSizeUnlimited",
  imageSizeLimit = "imageSizeLimit",
  keepScreenAwake = "keepScreenAwake",
  language = "language",
  locationAccuracyThreshold = "locationAccuracyThreshold",
  locationAccuracyWatchTimeout = "locationAccuracyWatchTimeout",
  locationAveragingEnabled = "locationAveragingEnabled",
  locationGpsLocked = "locationGpsLocked",
  preferredGpsSourceId = "preferredGpsSourceId",
  serverUrlType = "serverUrlType",
  serverUrl = "serverUrl",
  showRecordCompletion = "showRecordCompletion",
  showStatusBar = "showStatusBar",
  theme = "theme",
}

type SettingsProperties = Partial<Record<SettingKey, SettingsProperty>>;

const properties: SettingsProperties = {
  language: {
    type: PropertyType.dropdown,
    group: SettingGroup.appearance,
    options: LanguagesSettings,
  },
  theme: {
    type: PropertyType.dropdown,
    group: SettingGroup.appearance,
    options: Object.values(ThemesSettings).map((theme) => ({
      key: theme,
      label: `settings:theme.${theme}`,
    })),
  },
  fontScale: {
    type: PropertyType.slider,
    group: SettingGroup.appearance,
    minValue: 0.6,
    maxValue: 1.6,
    step: 0.2,
  },
  animationsEnabled: {
    type: PropertyType.boolean,
    group: SettingGroup.appearance,
  },
  fullScreen: {
    type: PropertyType.boolean,
    group: SettingGroup.dataEntry,
    isDisabled: () => Environment.isIOS,
  },
  keepScreenAwake: {
    type: PropertyType.boolean,
    group: SettingGroup.dataEntry,
  },
  showRecordCompletion: {
    type: PropertyType.boolean,
    group: SettingGroup.dataEntry,
  },
  showStatusBar: {
    type: PropertyType.boolean,
    group: SettingGroup.dataEntry,
  },
  locationAccuracyThreshold: {
    type: PropertyType.numeric,
    group: SettingGroup.location,
  },
  locationAccuracyWatchTimeout: {
    type: PropertyType.slider,
    group: SettingGroup.location,
    minValue: 30,
    maxValue: 300,
    step: 30,
  },
  locationAveragingEnabled: {
    type: PropertyType.boolean,
    group: SettingGroup.location,
  },
  locationGpsLocked: {
    type: PropertyType.boolean,
    group: SettingGroup.location,
  },
  // image resolution
  imageSizeUnlimited: {
    type: PropertyType.boolean,
    group: SettingGroup.images,
  },
  imageSizeLimit: {
    type: PropertyType.slider,
    group: SettingGroup.images,
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
  locationAveragingEnabled: boolean;
  locationGpsLocked: boolean;
  // GpsSourceSetting.auto/.internal, or `external:${deviceAddress}` for a
  // recognized bonded device (see service/externalGps) - the latter can't be part
  // of the enum since it's dynamic. Not exposed via the generic `properties`
  // schema/dropdown above because the available options are dynamic (depend on
  // what's currently bonded), unlike language/theme; rendered by a bespoke
  // GpsSourceSettingsField instead.
  preferredGpsSourceId: GpsSourceSetting | string;
  password?: string; // deprecated; not stored anymore;
  serverUrlType: "default";
  serverUrl: string;
  showRecordCompletion: boolean;
  showStatusBar: boolean;
  theme: ThemesSettings;
};

export const SettingsModel = {
  PropertyType,
  SettingGroup,
  SettingKey,
  properties,
};
