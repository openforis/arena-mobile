import { UUIDs, User } from "@openforis/arena-core";

import { PdfMap } from "model/PdfMap";
import { SettingsObject } from "model/SettingsModel";
import { Files } from "utils/Files";
import { GeoPdfInfo, GeoPdfParser } from "utils/GeoPdfParser";
import {
  GeoPdfTilePlanner,
  PdfMapGeoreference,
  PdfMapZoomRange,
} from "utils/GeoPdfTilePlanner";

import { PdfMapImportJob } from "./PdfMapImportJob";
import { PdfMapRenderer } from "./PdfMapRenderer";
import { PdfMapRepository } from "./pdfMapRepository";
import { PdfMapsStorage } from "./pdfMapsStorage";

// limit the tiles of a single map (rendering time and device storage)
const MAX_TILES_PER_MAP = 100000;
// tiles above the native resolution of the PDF are blurred: allow only a few more zoom levels
const MAX_EXTRA_ZOOM_LEVELS = 2;
const MAX_ZOOM = 21;
// average size of a rendered tile (mix of JPEG and PNG)
const AVERAGE_TILE_SIZE_BYTES = 25 * 1024;
const DEFAULT_OPACITY = 1;
const MAX_NAME_LENGTH = 100;

export type PdfMapPageCandidate = {
  pageIndex: number;
  // name of the main map frame of the page, if any
  viewportName?: string;
  georeference: PdfMapGeoreference;
  zoomRange: PdfMapZoomRange;
};

export type PdfMapFileAnalysis = {
  info: GeoPdfInfo;
  candidates: PdfMapPageCandidate[];
};

export type PdfMapEstimate = {
  tilesCount: number;
  estimatedSizeBytes: number;
  exceedsMaxTiles: boolean;
};

const isRendererAvailable = PdfMapRenderer.isAvailable;

// reads the georeferencing of the pages of the PDF file
const analyzeFile = async (fileUri: string): Promise<PdfMapFileAnalysis> => {
  const bytes = await Files.readAsBytes(fileUri);
  if (!bytes) {
    return {
      info: { pagesCount: 0, pages: [], hasUnsupportedGeoreference: false },
      candidates: [],
    };
  }
  const info = await GeoPdfParser.parse(bytes);
  const candidates: PdfMapPageCandidate[] = [];
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
      pageIndex: page.pageIndex,
      ...(viewport.name ? { viewportName: viewport.name } : {}),
      georeference,
      zoomRange: GeoPdfTilePlanner.computeZoomRange(georeference),
    });
  }
  return { info, candidates };
};

const getSelectableMaxZoomRange = (
  zoomRange: PdfMapZoomRange,
): { min: number; max: number } => ({
  min: zoomRange.minZoom,
  max: Math.min(MAX_ZOOM, zoomRange.nativeZoom + MAX_EXTRA_ZOOM_LEVELS),
});

const estimate = ({
  georeference,
  minZoom,
  maxZoom,
}: {
  georeference: PdfMapGeoreference;
  minZoom: number;
  maxZoom: number;
}): PdfMapEstimate => {
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
  fileName.replace(/\.pdf$/i, "");

const generateDefaultName = ({
  fileName,
  candidate,
  candidatesCount,
}: {
  fileName: string;
  candidate: PdfMapPageCandidate;
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
  pdfMaps,
  mapId,
}: {
  name: string;
  pdfMaps: PdfMap[];
  mapId?: string;
}): string | null => {
  const nameTrimmed = name.trim();
  if (!nameTrimmed) return "pdfMaps:validation.nameRequired";
  if (
    pdfMaps.some(
      (item) =>
        item.id !== mapId &&
        item.name.toLowerCase() === nameTrimmed.toLowerCase(),
    )
  ) {
    return "pdfMaps:validation.nameDuplicate";
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
  candidate: PdfMapPageCandidate;
  maxZoom: number;
}): PdfMapImportJob => {
  const { georeference, zoomRange } = candidate;
  const now = new Date().toISOString();
  const pdfMap: PdfMap = {
    id: UUIDs.v4(),
    name: name.trim(),
    fileName,
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
  return new PdfMapImportJob({
    user: {} as User,
    sourceFileUri,
    pdfMap,
    georeference,
  });
};

const fetchMaps = PdfMapRepository.fetchMaps;

const updateMap = async (
  mapId: string,
  changes: Partial<Pick<PdfMap, "name" | "visible" | "opacity">>,
): Promise<SettingsObject | null> => {
  const pdfMaps = await fetchMaps();
  const pdfMap = pdfMaps.find((item) => item.id === mapId);
  if (!pdfMap) return null;
  return PdfMapRepository.saveMap({
    ...pdfMap,
    ...changes,
    ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
    dateModified: new Date().toISOString(),
  });
};

const deleteMap = async (mapId: string): Promise<SettingsObject> => {
  const settingsNext = await PdfMapRepository.deleteMap(mapId);
  await Files.del(PdfMapsStorage.getMapDirUri(mapId), true);
  return settingsNext;
};

// size of all the PDF maps stored on the device (PDF files and tiles)
const getStorageSize = async (): Promise<number> =>
  Files.getDirSize(PdfMapsStorage.getRootDirUri());

export const PdfMapsService = {
  MAX_TILES_PER_MAP,

  isRendererAvailable,
  analyzeFile,
  getSelectableMaxZoomRange,
  estimate,
  generateDefaultName,
  validateName,
  createImportJob,
  fetchMaps,
  updateMap,
  deleteMap,
  getStorageSize,
  getTilesCachePath: PdfMapsStorage.getTilesCachePath,
};
