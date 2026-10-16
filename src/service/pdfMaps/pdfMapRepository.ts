import { PdfMap } from "model/PdfMap";
import { SettingsObject } from "model/SettingsModel";

import { SettingsService } from "../settingsService";

// PDF maps are stored in the settings: the maps read them from there to show the visible ones

const fetchMaps = async (): Promise<PdfMap[]> =>
  (await SettingsService.fetchSettings()).pdfMaps ?? [];

const saveMaps = async (pdfMaps: PdfMap[]): Promise<SettingsObject> => {
  const settings = await SettingsService.fetchSettings();
  const settingsNext: SettingsObject = { ...settings, pdfMaps };
  await SettingsService.saveSettings(settingsNext);
  return settingsNext;
};

const saveMap = async (pdfMap: PdfMap): Promise<SettingsObject> => {
  const pdfMaps = await fetchMaps();
  const index = pdfMaps.findIndex((item) => item.id === pdfMap.id);
  return saveMaps(
    index >= 0
      ? pdfMaps.map((item) => (item.id === pdfMap.id ? pdfMap : item))
      : [...pdfMaps, pdfMap],
  );
};

const deleteMap = async (id: string): Promise<SettingsObject> =>
  saveMaps((await fetchMaps()).filter((item) => item.id !== id));

export const PdfMapRepository = {
  fetchMaps,
  saveMap,
  deleteMap,
};
