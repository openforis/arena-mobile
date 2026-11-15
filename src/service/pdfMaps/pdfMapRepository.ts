import { PdfMap } from "model/PdfMap";
import { SettingsObject } from "model/SettingsModel";

import { SettingsService } from "../settingsService";

// PDF maps are stored in the settings: the maps read them from there to show the visible ones

const fetchMaps = async (): Promise<PdfMap[]> =>
  (await SettingsService.fetchSettings()).pdfMaps ?? [];

const updateMaps = (
  updateFn: (pdfMaps: PdfMap[]) => PdfMap[],
): Promise<SettingsObject> =>
  SettingsService.updateSettings((settings) => ({
    ...settings,
    pdfMaps: updateFn(settings.pdfMaps ?? []),
  }));

const saveMap = (pdfMap: PdfMap): Promise<SettingsObject> =>
  updateMaps((pdfMaps) =>
    pdfMaps.some((item) => item.id === pdfMap.id)
      ? pdfMaps.map((item) => (item.id === pdfMap.id ? pdfMap : item))
      : [...pdfMaps, pdfMap],
  );

const deleteMap = (id: string): Promise<SettingsObject> =>
  updateMaps((pdfMaps) => pdfMaps.filter((item) => item.id !== id));

export const PdfMapRepository = {
  fetchMaps,
  saveMap,
  deleteMap,
};
