import { GeoTIFF, GeoTIFFImage } from "geotiff";

import { GeoTiffBlockPlanner } from "utils/geoTiff/GeoTiffBlockPlanner";
import {
  GeoTiffFileSource,
  GeoTiffGeoreference,
  GeoTiffImages,
  GeoTiffUnsupportedError,
  PixelFormat,
  TileSource,
  createCachedTileSource,
  ensureTextDecoder,
  readWindowRgba,
} from "utils/geoTiff";
import {
  GeoPdfTilePlanner,
  ImportedMapGeoreference,
} from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform } from "utils/GeoPdfTransform";
import { log } from "utils/Logger";

import { ImportedMapRenderer } from "./ImportedMapRenderer";
import {
  BlockRenderer,
  JPEG_QUALITY,
  toBlockTileTargets,
  toFlatCoordinates,
} from "./importedMapTilesRenderer";

// GeoTIFF maps: georeference read from the file, blocks of tiles decoded with geotiff.js (JS thread)
// and drawn by the native module (see docs/plans/geotiff-maps-plan.md)

// the display space of a GeoTIFF is its pixel space: 1 display unit = 1 rendered pixel
// (72 DPI in the zoom computation, which counts display units as PDF points)
export const GEOTIFF_RENDER_DPI = 72;

// decoded tiles/strips kept in memory for each image level (strips are shared by several blocks)
const TILE_CACHE_MAX_BYTES = 48 * 1024 * 1024;

export type GeoTiffAnalysis =
  | { georeference: ImportedMapGeoreference; unsupportedFormat?: undefined }
  | { georeference: null; unsupportedFormat?: string };

const openGeoTiff = async (fileUri: string) => {
  ensureTextDecoder();
  GeoTiffImages.registerDecoders();
  const source = GeoTiffFileSource.open(fileUri);
  try {
    // implements the fetch() of the geotiff BaseSource (not a subclass)
    const tiff = await GeoTIFF.fromSource(
      source as unknown as Parameters<typeof GeoTIFF.fromSource>[0],
    );
    return { source, tiff };
  } catch (error) {
    await source.close();
    throw error;
  }
};

const analyzeImage = async (image: GeoTIFFImage): Promise<GeoTiffAnalysis> => {
  try {
    await GeoTiffImages.detectPixelFormat(image);
  } catch (error) {
    if (error instanceof GeoTiffUnsupportedError) {
      return { georeference: null, unsupportedFormat: error.reason };
    }
    throw error;
  }
  const pixelToCrs = await GeoTiffGeoreference.getPixelToCrs(image);
  const crs = GeoTiffGeoreference.getCrs(image);
  if (!pixelToCrs || !crs) return { georeference: null };
  const result = GeoTiffGeoreference.computeGeoreference({
    width: image.getWidth(),
    height: image.getHeight(),
    pixelToCrs,
    crs,
  });
  if (!result) return { georeference: null };
  // georeferencing as read from the file: useful to diagnose maps placed wrongly
  const geoKeysErrors = crs.errors.length
    ? ", GeoKeys errors: " + crs.errors.join("; ")
    : "";
  log.debug(
    `GeoTIFF map: ${image.getWidth()}x${image.getHeight()} px, CRS ${crs.proj4}, datum shift known: ${crs.datumShiftKnown}, fit error ${result.maxFitErrorMeters.toFixed(2)} m${geoKeysErrors}`,
  );
  return { georeference: result.georeference };
};

const analyze = async (fileUri: string): Promise<GeoTiffAnalysis> => {
  const { source, tiff } = await openGeoTiff(fileUri);
  try {
    return await analyzeImage(await tiff.getImage(0));
  } finally {
    await source.close();
  }
};

const computeZoomRange = (georeference: ImportedMapGeoreference) =>
  GeoPdfTilePlanner.computeZoomRange(georeference, GEOTIFF_RENDER_DPI);

type LevelReader = { tiles: TileSource; format: PixelFormat };

const createBlockRenderer = async (fileUri: string): Promise<BlockRenderer> => {
  const { source, tiff } = await openGeoTiff(fileUri);
  let levels: GeoTIFFImage[];
  try {
    levels = await GeoTiffImages.getLevels(tiff);
  } catch (error) {
    await source.close();
    throw error;
  }
  const levelSizes = levels.map((image) => ({
    width: image.getWidth(),
    height: image.getHeight(),
  }));
  const readers = new Map<number, Promise<LevelReader>>();
  const getReader = (level: number): Promise<LevelReader> => {
    let reader = readers.get(level);
    if (!reader) {
      const image = levels[level]!;
      reader = Promise.all([
        GeoTiffImages.createTileSource(image),
        GeoTiffImages.detectPixelFormat(image),
      ]).then(([tiles, format]) => ({
        tiles: createCachedTileSource(tiles, TILE_CACHE_MAX_BYTES),
        format,
      }));
      readers.set(level, reader);
    }
    return reader;
  };

  return {
    renderBlock: async (block, tilesPath) => {
      const plan = GeoTiffBlockPlanner.planBlockWindow({
        blockMatrix: block.matrix,
        blockWidth: block.width,
        blockHeight: block.height,
        levels: levelSizes,
      });
      if (!plan) return { written: 0, bytes: 0 };
      const { tiles, format } = await getReader(plan.level);
      const pixels = await readWindowRgba({
        tiles,
        format,
        window: plan.window,
        step: plan.step,
      });
      return ImportedMapRenderer.renderImageTiles(pixels.data, {
        pixelsWidth: pixels.width,
        pixelsHeight: pixels.height,
        matrix: plan.matrix,
        clipPolygon: toFlatCoordinates(block.clipPolygon),
        width: block.width,
        height: block.height,
        tileSize: GeoPdfTransform.TILE_SIZE,
        jpegQuality: JPEG_QUALITY,
        tiles: toBlockTileTargets(block, tilesPath),
      });
    },
    close: () => source.close(),
  };
};

export const GeoTiffMaps = {
  analyze,
  computeZoomRange,
  createBlockRenderer,
};
