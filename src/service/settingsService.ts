import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { StoredObject } from "./asyncStorage/StoredItem";
import { API } from "./api";
import { GpsSourceSetting } from "model/GpsSourceSettings";
import { ThemesSettings } from "model/Themes";
import { LanguageConstants } from "model/LanguageSettings";
import { MapLayers, MapProvider } from "model/MapLayers";
import { SettingKey, SettingsObject } from "model/SettingsModel";
import { AMConstants } from "utils/AMConstants";
import { SystemUtils } from "utils/SystemUtils";

const defaultSettings: Partial<SettingsObject> = {
  animationsEnabled: true,
  autoSyncEnabled: false,
  autoSyncOpenRecordIntervalMinutes: 5,
  autoSyncSlowCheckIntervalMinutes: 30,
  dataUploadChunkSizeKB: 2048, // 2MB
  fontScale: 1,
  imageSizeUnlimited: false,
  imageSizeLimit: 4, // MB
  language: LanguageConstants.system,
  locationAccuracyThreshold: 3,
  locationAccuracyWatchTimeout: 120,
  locationAveragingEnabled: true,
  mapLayer: MapLayers.defaultLayerId,
  mapProvider: MapProvider.default,
  positionTrackingAccuracyThreshold: 20,
  positionTrackingBatterySaver: true,
  positionTrackingMinDistance: 10,
  preferredGpsSourceId: GpsSourceSetting.auto,
  serverUrlType: "default",
  serverUrl: AMConstants.defaultServerUrl,
  showRecordCompletion: true,
  showStatusBar: false,
  theme: ThemesSettings.auto,
};

type SystemSettingApplier = ({
  key,
  value,
}: {
  key?: SettingKey;
  value: any;
}) => Promise<any>;

const systemSettingApplierByKey: Partial<
  Record<SettingKey, SystemSettingApplier>
> = {
  fullScreen: async ({ value }: any) => SystemUtils.setFullScreen(value),
  keepScreenAwake: async ({ value }: any) =>
    SystemUtils.setKeepScreenAwake(value),
};

// key of the imported maps up to version 2.11.3 (PDF maps only)
const LEGACY_IMPORTED_MAPS_KEY = "pdfMaps";

const migrateStoredSettings = (
  stored: SettingsObject | null,
): SettingsObject | null => {
  if (!stored || !(LEGACY_IMPORTED_MAPS_KEY in stored)) return stored;
  const { [LEGACY_IMPORTED_MAPS_KEY]: legacyImportedMaps, ...rest } =
    stored as SettingsObject & Record<string, unknown>;
  return {
    ...rest,
    importedMaps:
      rest.importedMaps ??
      (legacyImportedMaps as SettingsObject["importedMaps"]),
  };
};

// settings stored by previous versions are migrated when read (and saved at the next update)
class SettingsStore extends StoredObject<SettingsObject> {
  protected override fromStored(stored: SettingsObject | null): SettingsObject {
    return super.fromStored(migrateStoredSettings(stored));
  }
}

const settingsStore = new SettingsStore(
  asyncStorageKeys.settings,
  defaultSettings as SettingsObject,
);

const fetchSettings = (): Promise<SettingsObject> => settingsStore.fetch();

const updateSetting = async ({
  key,
  value,
}: {
  key: SettingKey;
  value: any;
}): Promise<SettingsObject> => {
  const settingsNext = await settingsStore.updateValue(key, value);
  await systemSettingApplierByKey[key]?.({ key, value });
  return settingsNext;
};

// prefer it to fetchSettings + saveSettings: it runs after the pending updates, so none gets lost
const updateSettings = (
  updateFn: (settings: SettingsObject) => SettingsObject,
): Promise<SettingsObject> => settingsStore.update(updateFn);

const saveSettings = (settings: SettingsObject): Promise<SettingsObject> =>
  settingsStore.save(settings);

const testServerUrl = async (serverUrl: any) => {
  try {
    const testResult = await API.test({ serverUrl, uri: "healthcheck" });
    return testResult;
  } catch {
    // server not reachable or not responding correctly
    return false;
  }
};

export const SettingsService = {
  fetchSettings,
  updateSetting,
  updateSettings,
  saveSettings,

  testServerUrl,
};
