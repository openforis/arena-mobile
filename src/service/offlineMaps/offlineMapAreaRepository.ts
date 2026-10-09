import { OfflineMapArea } from "model/OfflineMapArea";

import { AsyncStorageUtils } from "../asyncStorage/AsyncStorageUtils";
import { asyncStorageKeys } from "../asyncStorage/asyncStorageKeys";

const fetchAreas = async (): Promise<OfflineMapArea[]> =>
  (await AsyncStorageUtils.getItem(asyncStorageKeys.offlineMapAreas)) ?? [];

const saveAreas = async (areas: OfflineMapArea[]): Promise<void> => {
  await AsyncStorageUtils.setItem(asyncStorageKeys.offlineMapAreas, areas);
};

const fetchAreaById = async (id: string): Promise<OfflineMapArea | undefined> =>
  (await fetchAreas()).find((area) => area.id === id);

const saveArea = async (area: OfflineMapArea): Promise<void> => {
  const areas = await fetchAreas();
  const index = areas.findIndex((item) => item.id === area.id);
  if (index >= 0) {
    areas[index] = area;
  } else {
    areas.push(area);
  }
  await saveAreas(areas);
};

const deleteArea = async (id: string): Promise<void> => {
  const areas = await fetchAreas();
  await saveAreas(areas.filter((area) => area.id !== id));
};

const deleteAllAreas = async (): Promise<void> => {
  await AsyncStorageUtils.removeItem(asyncStorageKeys.offlineMapAreas);
};

export const OfflineMapAreaRepository = {
  fetchAreas,
  saveAreas,
  fetchAreaById,
  saveArea,
  deleteArea,
  deleteAllAreas,
};
