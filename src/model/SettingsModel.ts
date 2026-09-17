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
  autoSyncEnabled = "autoSyncEnabled",
  autoSyncOpenRecordIntervalMinutes = "autoSyncOpenRecordIntervalMinutes",
  autoSyncSlowCheckIntervalMinutes = "autoSyncSlowCheckIntervalMinutes",
  dataUploadChunkSizeKB = "dataUploadChunkSizeKB",
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
  autoSyncEnabled: {
    type: PropertyType.boolean,
    group: SettingGroup.dataEntry,
  },
  autoSyncOpenRecordIntervalMinutes: {
    type: PropertyType.slider,
    group: SettingGroup.dataEntry,
    minValue: 1,
    maxValue: 15,
    step: 1,
    isDisabled: ({ settings }: any) => !settings.autoSyncEnabled,
  },
  autoSyncSlowCheckIntervalMinutes: {
    type: PropertyType.slider,
    group: SettingGroup.dataEntry,
    minValue: 2,
    maxValue: 60,
    step: 1,
    isDisabled: ({ settings }: any) => !settings.autoSyncEnabled,
  },
  dataUploadChunkSizeKB: {
    type: PropertyType.dropdown,
    group: SettingGroup.dataEntry,
    options: [
      { key: 500, label: "500 KB", labelIsI18nKey: false },
      { key: 1024, label: "1 MB", labelIsI18nKey: false },
      { key: 2048, label: "2 MB", labelIsI18nKey: false },
      { key: 5120, label: "5 MB", labelIsI18nKey: false },
      { key: 10240, label: "10 MB", labelIsI18nKey: false },
      { key: 20480, label: "20 MB", labelIsI18nKey: false },
      { key: 51200, label: "50 MB", labelIsI18nKey: false },
    ],
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
  autoSyncEnabled: boolean;
  // how long (in minutes) the record currently open in the editor must stay idle before
  // auto-sync uploads it - see AUTO_SYNC_OPEN_RECORD_IDLE_THRESHOLD_MS in actionsAutoSync.ts
  autoSyncOpenRecordIntervalMinutes: number;
  // once everything is already synced, how long (in minutes) auto-sync waits before checking
  // the server again - see AUTO_SYNC_SLOW_CHECK_INTERVAL_MS in actionsAutoSync.ts
  autoSyncSlowCheckIntervalMinutes: number;
  // size, in KB, of each piece a record zip is split into while uploading - see
  // recordRemoteService.ts
  dataUploadChunkSizeKB: number;
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
