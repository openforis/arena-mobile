import { MapLayerId } from "model/MapLayers";
import { Files } from "utils/Files";
import { MapTileUtils, TileCoordinate } from "utils/MapTileUtils";

export const MAP_TILES_FOLDER_NAME = "map_tiles";

const FILE_URI_PREFIX = "file://";

const getTilesRootDirUri = (): string =>
  Files.path(Files.documentDirectory, MAP_TILES_FOLDER_NAME);

const getLayerTilesDirUri = (layerId: MapLayerId): string =>
  Files.path(getTilesRootDirUri(), layerId);

// UrlTile's tileCachePath expects a plain file system path (the Android implementation doesn't always strip the file:// scheme)
const getLayerTileCachePath = (layerId: MapLayerId): string => {
  const uri = getLayerTilesDirUri(layerId);
  const path = uri.startsWith(FILE_URI_PREFIX)
    ? uri.substring(FILE_URI_PREFIX.length)
    : uri;
  return decodeURI(path);
};

const getTileFileUri = (layerId: MapLayerId, tile: TileCoordinate): string =>
  Files.path(
    getLayerTilesDirUri(layerId),
    MapTileUtils.getTileRelativePath(tile),
  );

const getTileDirUri = (layerId: MapLayerId, { x, z }: TileCoordinate): string =>
  Files.path(getLayerTilesDirUri(layerId), String(z), String(x));

export const OfflineMapTilesStorage = {
  getTilesRootDirUri,
  getLayerTilesDirUri,
  getLayerTileCachePath,
  getTileFileUri,
  getTileDirUri,
};
