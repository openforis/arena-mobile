import { Files } from "utils/Files";

export const PDF_MAPS_FOLDER_NAME = "pdf_maps";

const PDF_MAP_PREVIEWS_FOLDER_NAME = "pdf_map_previews";
const FILE_URI_PREFIX = "file://";
const SOURCE_FILE_NAME = "source.pdf";
const TILES_FOLDER_NAME = "tiles";

const getRootDirUri = (): string =>
  Files.path(Files.documentDirectory, PDF_MAPS_FOLDER_NAME);

const getMapDirUri = (mapId: string): string =>
  Files.path(getRootDirUri(), mapId);

const getSourceFileUri = (mapId: string): string =>
  Files.path(getMapDirUri(mapId), SOURCE_FILE_NAME);

const getTilesDirUri = (mapId: string): string =>
  Files.path(getMapDirUri(mapId), TILES_FOLDER_NAME);

// native code expects plain file system paths (without the file:// scheme)
const toFileSystemPath = (uri: string): string =>
  decodeURI(
    uri.startsWith(FILE_URI_PREFIX)
      ? uri.substring(FILE_URI_PREFIX.length)
      : uri,
  );

// tiles are stored with the same layout of the map tile cache ({z}/{x}/{y}),
// so they can be shown with a UrlTile in offline mode
const getTilesCachePath = (mapId: string): string =>
  toFileSystemPath(getTilesDirUri(mapId));

// temporary tiles rendered to preview a PDF map before importing it
const getPreviewsRootDirUri = (): string =>
  Files.path(Files.cacheDirectory, PDF_MAP_PREVIEWS_FOLDER_NAME);

const getPreviewDirUri = (previewId: string): string =>
  Files.path(getPreviewsRootDirUri(), previewId);

export const PdfMapsStorage = {
  getRootDirUri,
  getMapDirUri,
  getSourceFileUri,
  getTilesDirUri,
  getTilesCachePath,
  getPreviewsRootDirUri,
  getPreviewDirUri,
  toFileSystemPath,
};
