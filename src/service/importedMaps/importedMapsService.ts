import { UUIDs, ArenaUser } from "@openforis/arena-core";
import { File } from "expo-file-system";

import { ImportedMap, ImportedMapSourceType } from "model/ImportedMap";
import { SettingsObject } from "model/SettingsModel";
import { Files } from "utils/Files";
import { GeoPdfInfo, GeoPdfParser } from "utils/GeoPdfParser";
import {
  FILE_TYPE_HEADER_LENGTH,
  detectMapFileType,
} from "utils/geoTiff/fileType";
import { log } from "utils/Logger";
import {
  GeoPdfTilePlanner,
  ImportedMapGeoreference,
  ImportedMapZoomRange,
} from "utils/GeoPdfTilePlanner";

import { ImportedMapImportJob } from "./ImportedMapImportJob";
import { ImportedMapRenderer } from "./ImportedMapRenderer";
import { ImportedMapRepository } from "./importedMapRepository";
import { ImportedMapsStorage } from "./importedMapsStorage";
import { ImportedMapTilesRenderer } from "./importedMapTilesRenderer";
import { createBlockRenderer } from "./blockRenderers";
import { GeoTiffMaps } from "./geoTiffMaps";

// limit the tiles of a single map (rendering time and device storage)
const MAX_TILES_PER_MAP = 100000;
// tiles above the native resolution of the map are blurred: allow only a few more zoom levels
const MAX_EXTRA_ZOOM_LEVELS = 2;
const MAX_ZOOM = 21;
// average size of a rendered tile (mix of JPEG and PNG)
const AVERAGE_TILE_SIZE_BYTES = 25 * 1024;
const DEFAULT_OPACITY = 1;
// the preview is rendered only for the lowest zoom levels, to be fast
const PREVIEW_ZOOM_LEVELS = 4;
const MAX_NAME_LENGTH = 100;

export type ImportedMapPageCandidate = {
  sourceType: ImportedMapSourceType;
  // PDF page (0 for GeoTIFF)
  pageIndex: number;
  // name of the main map frame of the page, if any
  viewportName?: string;
  georeference: ImportedMapGeoreference;
  zoomRange: ImportedMapZoomRange;
};

export type ImportedMapFileAnalysis = {
  // null: neither a PDF nor a TIFF file
  sourceType: ImportedMapSourceType | null;
  // PDF only
  info?: GeoPdfInfo;
  candidates: ImportedMapPageCandidate[];
  // GeoTIFF: why its pixels cannot be read (e.g. "16 bits per sample")
  unsupportedFormat?: string;
  // the native renderer of this build cannot render the file (GeoTIFF in builds made before its support)
  rendererNotAvailable?: boolean;
};

// tiles rendered into a temporary folder to preview the map before importing it
export type ImportedMapPreview = {
  id: string;
  tilesPath: string;
  minZoom: number;
  maxZoom: number;
};

export type ImportedMapEstimate = {
  tilesCount: number;
  estimatedSizeBytes: number;
  exceedsMaxTiles: boolean;
};

const isRendererAvailable = ImportedMapRenderer.isAvailable;

// reads the georeferencing of the pages of the PDF file
const analyzePdf = async (
  fileUri: string,
): Promise<ImportedMapFileAnalysis> => {
  const bytes = await Files.readAsBytes(fileUri);
  if (!bytes) {
    return {
      sourceType: "pdf",
      info: { pagesCount: 0, pages: [], hasUnsupportedGeoreference: false },
      candidates: [],
    };
  }
  const info = await GeoPdfParser.parse(bytes);
  // georeferencing as read from the file: useful to diagnose maps placed or oriented wrongly
  log.debug(`PDF map georeferencing: ${JSON.stringify(info)}`);
  const candidates: ImportedMapPageCandidate[] = [];
  for (const page of info.pages) {
    // the main map frame is the first viewport (the biggest one)
    const viewport = page.viewports[0];
    if (!viewport) continue;
    const georeference = GeoPdfTilePlanner.computeGeoreference({
      page,
      viewport,
    });
    if (!georeference) continue;
    candidates.push({
      sourceType: "pdf",
      pageIndex: page.pageIndex,
      ...(viewport.name ? { viewportName: viewport.name } : {}),
      georeference,
      zoomRange: GeoPdfTilePlanner.computeZoomRange(georeference),
    });
  }
  return { sourceType: "pdf", info, candidates };
};

const analyzeGeoTiff = async (
  fileUri: string,
): Promise<ImportedMapFileAnalysis> => {
  const { georeference, unsupportedFormat } =
    await GeoTiffMaps.analyze(fileUri);
  if (!georeference) {
    return { sourceType: "geotiff", candidates: [], unsupportedFormat };
  }
  return {
    sourceType: "geotiff",
    candidates: [
      {
        sourceType: "geotiff",
        pageIndex: 0,
        georeference,
        zoomRange: GeoTiffMaps.computeZoomRange(georeference),
      },
    ],
  };
};

const readFileHeader = (fileUri: string): Uint8Array => {
  const handle = new File(fileUri).open();
  try {
    return handle.readBytesSync(FILE_TYPE_HEADER_LENGTH);
  } finally {
    handle.close();
  }
};

// reads the georeferencing of the file (PDF or GeoTIFF, detected from its content)
const analyzeFile = async (
  fileUri: string,
): Promise<ImportedMapFileAnalysis> => {
  const sourceType = detectMapFileType(readFileHeader(fileUri));
  if (sourceType === "pdf") return analyzePdf(fileUri);
  if (sourceType === "geotiff") {
    if (!ImportedMapRenderer.isImageRenderingAvailable()) {
      return { sourceType, candidates: [], rendererNotAvailable: true };
    }
    return analyzeGeoTiff(fileUri);
  }
  return { sourceType: null, candidates: [] };
};

const getSelectableMaxZoomRange = (
  zoomRange: ImportedMapZoomRange,
): { min: number; max: number } => ({
  min: zoomRange.minZoom,
  max: Math.min(MAX_ZOOM, zoomRange.nativeZoom + MAX_EXTRA_ZOOM_LEVELS),
});

const estimate = ({
  georeference,
  minZoom,
  maxZoom,
}: {
  georeference: ImportedMapGeoreference;
  minZoom: number;
  maxZoom: number;
}): ImportedMapEstimate => {
  const tilesCount = GeoPdfTilePlanner.countTiles({
    neatline: georeference.neatline,
    minZoom,
    maxZoom,
  });
  return {
    tilesCount,
    estimatedSizeBytes: tilesCount * AVERAGE_TILE_SIZE_BYTES,
    exceedsMaxTiles: tilesCount > MAX_TILES_PER_MAP,
  };
};

const getFileNameWithoutExtension = (fileName: string): string =>
  fileName.replace(/\.(pdf|tiff?)$/i, "");

const generateDefaultName = ({
  fileName,
  candidate,
  candidatesCount,
}: {
  fileName: string;
  candidate: ImportedMapPageCandidate;
  candidatesCount: number;
}): string => {
  const baseName = getFileNameWithoutExtension(fileName);
  const name =
    candidatesCount > 1
      ? `${baseName} (${candidate.viewportName ?? candidate.pageIndex + 1})`
      : baseName;
  return name.substring(0, MAX_NAME_LENGTH);
};

const validateName = ({
  name,
  importedMaps,
  mapId,
}: {
  name: string;
  importedMaps: ImportedMap[];
  mapId?: string;
}): string | null => {
  const nameTrimmed = name.trim();
  if (!nameTrimmed) return "importedMaps:validation.nameRequired";
  if (
    importedMaps.some(
      (item) =>
        item.id !== mapId &&
        item.name.toLowerCase() === nameTrimmed.toLowerCase(),
    )
  ) {
    return "importedMaps:validation.nameDuplicate";
  }
  return null;
};

const createImportJob = ({
  sourceFileUri,
  fileName,
  name,
  candidate,
  maxZoom,
}: {
  sourceFileUri: string;
  fileName: string;
  name: string;
  candidate: ImportedMapPageCandidate;
  maxZoom: number;
}): ImportedMapImportJob => {
  const { georeference, zoomRange } = candidate;
  const now = new Date().toISOString();
  const importedMap: ImportedMap = {
    id: UUIDs.v4(),
    name: name.trim(),
    fileName,
    sourceType: candidate.sourceType,
    pageIndex: candidate.pageIndex,
    neatline: georeference.neatline,
    minZoom: Math.min(zoomRange.minZoom, maxZoom),
    maxZoom,
    tilesCount: 0,
    sizeBytes: 0,
    sourceSizeBytes: 0,
    datumCompatible: georeference.datumCompatible,
    visible: true,
    opacity: DEFAULT_OPACITY,
    dateCreated: now,
    dateModified: now,
  };
  return new ImportedMapImportJob({
    user: {} as ArenaUser,
    sourceFileUri,
    importedMap,
    georeference,
  });
};

// renders the lowest zoom levels of the map; resolves with null if stopped
const renderPreview = async ({
  sourceFileUri,
  candidate,
  shouldStop,
}: {
  sourceFileUri: string;
  candidate: ImportedMapPageCandidate;
  shouldStop: () => boolean;
}): Promise<ImportedMapPreview | null> => {
  const { georeference, zoomRange } = candidate;
  const id = UUIDs.v4();
  const dirUri = ImportedMapsStorage.getPreviewDirUri(id);
  const minZoom = zoomRange.minZoom;
  const maxZoom = Math.min(
    zoomRange.maxZoom,
    minZoom + PREVIEW_ZOOM_LEVELS - 1,
  );
  try {
    await Files.mkDir(dirUri);
    const tilesPath = ImportedMapsStorage.toFileSystemPath(dirUri);
    await ImportedMapTilesRenderer.renderTiles({
      blockRenderer: await createBlockRenderer({
        sourceType: candidate.sourceType,
        sourceFileUri,
        pageIndex: candidate.pageIndex,
      }),
      georeference,
      minZoom,
      maxZoom,
      tilesPath,
      shouldStop,
    });
    if (shouldStop()) {
      await Files.del(dirUri, true);
      return null;
    }
    return { id, tilesPath, minZoom, maxZoom };
  } catch (error) {
    await Files.del(dirUri, true);
    throw error;
  }
};

const deleteAllPreviews = (): Promise<void> =>
  Files.del(ImportedMapsStorage.getPreviewsRootDirUri(), true);

const fetchMaps = ImportedMapRepository.fetchMaps;

const updateMap = async (
  mapId: string,
  changes: Partial<Pick<ImportedMap, "name" | "visible" | "opacity">>,
): Promise<SettingsObject | null> => {
  const importedMaps = await fetchMaps();
  const importedMap = importedMaps.find((item) => item.id === mapId);
  if (!importedMap) return null;
  return ImportedMapRepository.saveMap({
    ...importedMap,
    ...changes,
    ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
    dateModified: new Date().toISOString(),
  });
};

const deleteMap = async (mapId: string): Promise<SettingsObject> => {
  const settingsNext = await ImportedMapRepository.deleteMap(mapId);
  await Files.del(ImportedMapsStorage.getMapDirUri(mapId), true);
  return settingsNext;
};

// size of all the PDF maps stored on the device (PDF files and tiles)
const getStorageSize = async (): Promise<number> =>
  Files.getDirSize(ImportedMapsStorage.getRootDirUri());

export const ImportedMapsService = {
  MAX_TILES_PER_MAP,

  isRendererAvailable,
  analyzeFile,
  getSelectableMaxZoomRange,
  estimate,
  generateDefaultName,
  validateName,
  createImportJob,
  renderPreview,
  deleteAllPreviews,
  fetchMaps,
  updateMap,
  deleteMap,
  getStorageSize,
  getTilesCachePath: ImportedMapsStorage.getTilesCachePath,
};
