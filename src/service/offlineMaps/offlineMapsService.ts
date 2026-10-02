import { UUIDs, User } from "@openforis/arena-core";

import { LatLng } from "model/LocationPoint";
import { MapLayerId, MapLayers } from "model/MapLayers";
import { OfflineMapArea } from "model/OfflineMapArea";
import { Files } from "utils/Files";
import { GeoUtils } from "utils/GeoUtils";
import { MapTileUtils } from "utils/MapTileUtils";
import { PromiseUtils } from "utils/PromiseUtils";

import { OfflineMapAreaDownloadJob } from "./OfflineMapAreaDownloadJob";
import { OfflineMapAreaRepository } from "./offlineMapAreaRepository";
import { OfflineMapAreaValidator } from "./offlineMapAreaValidator";
import { OfflineMapTilesStorage } from "./offlineMapTilesStorage";

// limit the number of tiles of a single area, not to overload the free tile servers
// (and the device storage)
const MAX_TILES_PER_AREA = 50000;
const DEFAULT_MIN_ZOOM = 0;
const DEFAULT_MAX_ZOOM = 17;
const MIN_SELECTABLE_MAX_ZOOM = 10;
const MAX_CONCURRENT_DELETES = 8;

export type OfflineMapAreaEstimate = {
  tilesCount: number;
  estimatedSizeBytes: number;
  exceedsMaxTiles: boolean;
};

const estimateArea = ({
  coordinates,
  layerId,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom,
}: {
  coordinates: LatLng[];
  layerId: MapLayerId;
  minZoom?: number;
  maxZoom: number;
}): OfflineMapAreaEstimate => {
  if (coordinates.length < 3) {
    return { tilesCount: 0, estimatedSizeBytes: 0, exceedsMaxTiles: false };
  }
  const layer = MapLayers.getLayer(layerId);
  const tilesCount = MapTileUtils.countTilesForPolygon({
    coordinates,
    minZoom,
    maxZoom,
  });
  return {
    tilesCount,
    estimatedSizeBytes: tilesCount * layer.averageTileSizeBytes,
    exceedsMaxTiles: tilesCount > MAX_TILES_PER_AREA,
  };
};

const fetchAreas = async (): Promise<OfflineMapArea[]> =>
  OfflineMapAreaRepository.fetchAreas();

const fetchAreaById = async (id: string) =>
  OfflineMapAreaRepository.fetchAreaById(id);

const createArea = ({
  name,
  layerId,
  coordinates,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom,
}: {
  name: string;
  layerId: MapLayerId;
  coordinates: LatLng[];
  minZoom?: number;
  maxZoom: number;
}): OfflineMapArea => {
  const now = new Date().toISOString();
  return {
    id: UUIDs.v4(),
    name,
    layerId,
    coordinates,
    areaSquareMeters: GeoUtils.computePolygonArea(coordinates),
    minZoom,
    maxZoom,
    tilesCount: 0,
    downloadedTilesCount: 0,
    failedTilesCount: 0,
    sizeBytes: 0,
    dateCreated: now,
    dateModified: now,
  };
};

const validateAreaName = OfflineMapAreaValidator.validateName;

// renames the area; resolves with the updated area (null if the area does not exist or the name is not valid)
const renameArea = async ({
  areaId,
  name,
}: {
  areaId: string;
  name: string;
}): Promise<OfflineMapArea | null> => {
  const areas = await fetchAreas();
  const area = areas.find((item) => item.id === areaId);
  if (!area || validateAreaName({ name, areas, areaId })) return null;
  const areaUpdated: OfflineMapArea = { ...area, name: name.trim() };
  await OfflineMapAreaRepository.saveArea(areaUpdated);
  return areaUpdated;
};

// surface of the area polygon in square meters (calculated when not stored in the area)
const getAreaSquareMeters = (area: OfflineMapArea): number =>
  area.areaSquareMeters ?? GeoUtils.computePolygonArea(area.coordinates);

// creates a job that downloads the tiles of the area (tiles already on the device are skipped);
// the job must be started by the caller
const createDownloadJob = (area: OfflineMapArea): OfflineMapAreaDownloadJob =>
  new OfflineMapAreaDownloadJob({ user: {} as User, area });

const computeAreaTileKeys = (area: OfflineMapArea): Set<string> =>
  new Set(
    MapTileUtils.computeTilesForPolygon(area).map(MapTileUtils.getTileKey),
  );

const deleteArea = async (areaId: string): Promise<void> => {
  const areas = await fetchAreas();
  const area = areas.find((item) => item.id === areaId);
  if (!area) return;

  const otherAreasSameLayer = areas.filter(
    (item) => item.id !== areaId && item.layerId === area.layerId,
  );
  if (otherAreasSameLayer.length === 0) {
    // no other areas use this layer: delete the whole layer tiles folder (includes browsing cache)
    await Files.del(
      OfflineMapTilesStorage.getLayerTilesDirUri(area.layerId),
      true,
    );
  } else {
    // delete only the tiles not used by other areas
    const tilesToKeep = new Set<string>();
    for (const otherArea of otherAreasSameLayer) {
      computeAreaTileKeys(otherArea).forEach((key) => tilesToKeep.add(key));
    }
    const tilesToDelete = MapTileUtils.computeTilesForPolygon(area).filter(
      (tile) => !tilesToKeep.has(MapTileUtils.getTileKey(tile)),
    );
    await PromiseUtils.runWithConcurrency({
      items: tilesToDelete,
      concurrency: MAX_CONCURRENT_DELETES,
      task: (tile) =>
        Files.del(
          OfflineMapTilesStorage.getTileFileUri(area.layerId, tile),
          true,
        ),
    });
  }
  await OfflineMapAreaRepository.deleteArea(areaId);
};

const deleteAllAreas = async (): Promise<void> => {
  await Files.del(OfflineMapTilesStorage.getTilesRootDirUri(), true);
  await OfflineMapAreaRepository.deleteAllAreas();
};

// size of all the map tiles stored on the device (pre-fetched areas and tiles cached while browsing the map)
const getTilesStorageSize = async (): Promise<number> =>
  Files.getDirSize(OfflineMapTilesStorage.getTilesRootDirUri());

export const OfflineMapsService = {
  MAX_TILES_PER_AREA,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  MIN_SELECTABLE_MAX_ZOOM,

  estimateArea,
  fetchAreas,
  fetchAreaById,
  createArea,
  renameArea,
  validateAreaName,
  getAreaSquareMeters,
  createDownloadJob,
  deleteArea,
  deleteAllAreas,
  getTilesStorageSize,
};
