import { OfflineMapArea } from "model/OfflineMapArea";
import { asyncStorageKeys } from "../asyncStorage/asyncStorageKeys";
import { StoredItem } from "../asyncStorage/StoredItem";

const areasStore = new StoredItem<OfflineMapArea[]>(
  asyncStorageKeys.offlineMapAreas,
  [],
);

const fetchAreas = (): Promise<OfflineMapArea[]> => areasStore.fetch();

const updateAreas = async (
  updateFn: (areas: OfflineMapArea[]) => OfflineMapArea[],
): Promise<void> => {
  await areasStore.update(updateFn);
};

const fetchAreaById = async (id: string): Promise<OfflineMapArea | undefined> =>
  (await fetchAreas()).find((area) => area.id === id);

const saveArea = (area: OfflineMapArea): Promise<void> =>
  updateAreas((areas) =>
    areas.some((item) => item.id === area.id)
      ? areas.map((item) => (item.id === area.id ? area : item))
      : [...areas, area],
  );

const deleteArea = (id: string): Promise<void> =>
  updateAreas((areas) => areas.filter((area) => area.id !== id));

const deleteAllAreas = (): Promise<void> => areasStore.clear();

export const OfflineMapAreaRepository = {
  fetchAreas,
  updateAreas,
  fetchAreaById,
  saveArea,
  deleteArea,
  deleteAllAreas,
};
