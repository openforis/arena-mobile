import { ImportedMap } from "model/ImportedMap";
import { SettingsObject } from "model/SettingsModel";

import { SettingsService } from "../settingsService";

// PDF maps are stored in the settings: the maps read them from there to show the visible ones

const fetchMaps = async (): Promise<ImportedMap[]> =>
  (await SettingsService.fetchSettings()).importedMaps ?? [];

const updateMaps = (
  updateFn: (importedMaps: ImportedMap[]) => ImportedMap[],
): Promise<SettingsObject> =>
  SettingsService.updateSettings((settings) => ({
    ...settings,
    importedMaps: updateFn(settings.importedMaps ?? []),
  }));

const saveMap = (importedMap: ImportedMap): Promise<SettingsObject> =>
  updateMaps((importedMaps) =>
    importedMaps.some((item) => item.id === importedMap.id)
      ? importedMaps.map((item) =>
          item.id === importedMap.id ? importedMap : item,
        )
      : [...importedMaps, importedMap],
  );

const deleteMap = (id: string): Promise<SettingsObject> =>
  updateMaps((importedMaps) => importedMaps.filter((item) => item.id !== id));

export const ImportedMapRepository = {
  fetchMaps,
  saveMap,
  deleteMap,
};
