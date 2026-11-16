import { GeoTIFF, GeoTIFFImage } from "geotiff";
import { Platform } from "react-native";

import {
  GeoTiffFileSource,
  GeoTiffGeoreference,
  GeoTiffImages,
  PixelFormat,
  TileSource,
  Window,
  createCachedTileSource,
  ensureTextDecoder,
  readWindowRgba,
} from "utils/geoTiff";

// Developer tool: measures reading, georeferencing and decoding a GeoTIFF on the device
// (geotiff.js runs on the JS thread, so the timings depend on the JS engine; see docs/geotiff-maps-plan.md)

const DEFAULT_BLOCK_SIZE = 1024;
const TILE_CACHE_MAX_BYTES = 64 * 1024 * 1024;
const LAG_CHECK_INTERVAL_MS = 50;

export type GeoTiffBenchmarkOptions = {
  fileUri: string;
  blockSize?: number;
  // stop after this number of blocks (all the blocks when not specified)
  maxBlocks?: number;
  shouldStop?: () => boolean;
  onLog: (line: string) => void;
  onProgress?: (done: number, total: number) => void;
};

const now = () => performance.now();

const formatMs = (ms: number): string =>
  ms < 10000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(1)} s`;

const formatMb = (bytes: number): string =>
  `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const formatLatLng = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): string => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

const yieldToEventLoop = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

const getHermes = (): any => (globalThis as any).HermesInternal;

const getHeapSize = (): number | null =>
  getHermes()?.getInstrumentedStats?.()?.js_heapSize ?? null;

// max delay of a timer: how long the JS thread was blocked (UI not updated)
const startLagMonitor = () => {
  let maxLag = 0;
  let expected = now() + LAG_CHECK_INTERVAL_MS;
  const interval = setInterval(() => {
    const current = now();
    maxLag = Math.max(maxLag, current - expected);
    expected = current + LAG_CHECK_INTERVAL_MS;
  }, LAG_CHECK_INTERVAL_MS);
  return {
    stop: () => {
      clearInterval(interval);
      return maxLag;
    },
  };
};

const logEnvironment = (log: (line: string) => void) => {
  const hermes = getHermes();
  const hermesVersion =
    hermes?.getRuntimeProperties?.()?.["OSS Release Version"] ?? "?";
  log(
    `Platform: ${Platform.OS} ${String(Platform.Version)}; ${__DEV__ ? "development" : "release"} build`,
  );
  log(`JS engine: ${hermes ? `Hermes ${hermesVersion}` : "not Hermes"}`);
  log(`TextDecoder: ${ensureTextDecoder() ? "native" : "fallback"}`);
};

const logImageInfo = async ({
  tiff,
  image,
  log,
}: {
  tiff: GeoTIFF;
  image: GeoTIFFImage;
  log: (line: string) => void;
}) => {
  const directory = image.fileDirectory;
  const value = (tag: string) => directory.loadValue(tag as any);
  const imagesCount = await tiff.getImageCount();
  const overviews: string[] = [];
  for (let index = 1; index < imagesCount; index++) {
    const overview = await tiff.getImage(index);
    overviews.push(`${overview.getWidth()}x${overview.getHeight()}`);
  }
  log(
    `Image: ${image.getWidth()}x${image.getHeight()} px, ${image.getSamplesPerPixel()} samples x ${image.getBitsPerSample()} bits, compression ${await value("Compression")}, photometric ${await value("PhotometricInterpretation")}, predictor ${(await value("Predictor")) ?? 1}`,
  );
  log(
    `Layout: ${image.isTiled ? "tiled" : "strips"} ${image.getTileWidth()}x${image.getTileHeight()}; overviews: ${overviews.length ? overviews.join(", ") : "none"}`,
  );
};

const logGeoreference = async (
  image: GeoTIFFImage,
  log: (line: string) => void,
) => {
  const start = now();
  const pixelToCrs = await GeoTiffGeoreference.getPixelToCrs(image);
  const crs = GeoTiffGeoreference.getCrs(image);
  if (!pixelToCrs || !crs) {
    log("Georeference: none (not a GeoTIFF)");
    return;
  }
  const width = image.getWidth();
  const height = image.getHeight();
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ].map(([column, row]) => crs.toLatLng(...pixelToCrs(column!, row!)));
  const elapsed = now() - start;
  log(`CRS (proj4): ${crs.proj4}`);
  if (!crs.datumShiftKnown) {
    log("WARNING: datum shift to WGS84 unknown (the map can be shifted)");
  }
  if (crs.errors.length) log(`GeoKeys errors: ${crs.errors.join("; ")}`);
  log(`Corners (lat, lon): ${corners.map(formatLatLng).join(" | ")}`);
  log(`Georeference computed in ${formatMs(elapsed)}`);
};

const getBlockWindows = ({
  width,
  height,
  blockSize,
}: {
  width: number;
  height: number;
  blockSize: number;
}): Window[] => {
  const windows: Window[] = [];
  // row by row: the blocks of a row share the strips (kept in the cache)
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      windows.push([
        x,
        y,
        Math.min(x + blockSize, width),
        Math.min(y + blockSize, height),
      ]);
    }
  }
  return windows;
};

const benchmarkFullResolution = async ({
  image,
  format,
  source,
  blockSize,
  maxBlocks,
  shouldStop,
  log,
  onProgress,
}: {
  image: GeoTIFFImage;
  format: PixelFormat;
  source: GeoTiffFileSource;
  blockSize: number;
  maxBlocks?: number;
  shouldStop: () => boolean;
  log: (line: string) => void;
  onProgress?: (done: number, total: number) => void;
}) => {
  const allWindows = getBlockWindows({
    width: image.getWidth(),
    height: image.getHeight(),
    blockSize,
  });
  const windows = maxBlocks ? allWindows.slice(0, maxBlocks) : allWindows;
  log(
    `Decoding ${windows.length} of ${allWindows.length} blocks of ${blockSize}x${blockSize} px at full resolution...`,
  );
  const tiles = createCachedTileSource(
    await GeoTiffImages.createTileSource(image),
    TILE_CACHE_MAX_BYTES,
  );
  const readsBefore = source.readsCount;
  const bytesBefore = source.bytesRead;
  const lagMonitor = startLagMonitor();
  const start = now();
  let pixels = 0;
  let maxBlockMs = 0;
  let blocksDone = 0;
  for (const window of windows) {
    if (shouldStop()) break;
    const blockStart = now();
    const result = await readWindowRgba({ tiles, format, window });
    maxBlockMs = Math.max(maxBlockMs, now() - blockStart);
    pixels += result.width * result.height;
    blocksDone += 1;
    onProgress?.(blocksDone, windows.length);
    await yieldToEventLoop();
  }
  const elapsed = now() - start;
  const maxLag = lagMonitor.stop();
  const heapSize = getHeapSize();
  log(
    `Full resolution: ${blocksDone} blocks, ${(pixels / 1e6).toFixed(1)} Mpx in ${formatMs(elapsed)} = ${(pixels / 1e6 / (elapsed / 1000)).toFixed(2)} Mpx/s${shouldStop() ? " (stopped)" : ""}`,
  );
  log(
    `  slowest block ${formatMs(maxBlockMs)}, JS thread blocked max ${formatMs(maxLag)}`,
  );
  log(
    `  tiles/strips decoded ${tiles.decodedCount()}, file reads ${source.readsCount - readsBefore} (${formatMb(source.bytesRead - bytesBefore)})${heapSize ? `, JS heap ${formatMb(heapSize)}` : ""}`,
  );
  if (blocksDone < allWindows.length && blocksDone > 0) {
    const estimate = (elapsed / pixels) * image.getWidth() * image.getHeight();
    log(`  whole image estimate: ${formatMs(estimate)}`);
  }
};

const compareWithReadRgb = async ({
  image,
  format,
  blockSize,
  log,
}: {
  image: GeoTIFFImage;
  format: PixelFormat;
  blockSize: number;
  log: (line: string) => void;
}) => {
  const window: Window = [
    0,
    0,
    Math.min(blockSize, image.getWidth()),
    Math.min(blockSize, image.getHeight()),
  ];
  // warm-up (decoder loading, first allocations): not measured
  await readWindowRgba({
    tiles: await GeoTiffImages.createTileSource(image),
    format,
    window,
  });
  const fastStart = now();
  await readWindowRgba({
    tiles: await GeoTiffImages.createTileSource(image),
    format,
    window,
  });
  const fastMs = now() - fastStart;
  const readRgbStart = now();
  await image.readRGB({ window, interleave: true, enableAlpha: true });
  const readRgbMs = now() - readRgbStart;
  log(
    `First block: fast path ${formatMs(fastMs)}, geotiff.js readRGB ${formatMs(readRgbMs)}`,
  );
};

// whole image into ~blockSize px (lowest zooms, preview): closest overview at or above that size
const benchmarkLowZoom = async ({
  tiff,
  source,
  blockSize,
  log,
}: {
  tiff: GeoTIFF;
  source: GeoTiffFileSource;
  blockSize: number;
  log: (line: string) => void;
}) => {
  const imagesCount = await tiff.getImageCount();
  let best = await tiff.getImage(0);
  for (let index = 1; index < imagesCount; index++) {
    const overview = await tiff.getImage(index);
    if (Math.max(overview.getWidth(), overview.getHeight()) >= blockSize) {
      best = overview;
    }
  }
  const width = best.getWidth();
  const height = best.getHeight();
  const step = Math.max(1, Math.floor(Math.max(width, height) / blockSize));
  const readsBefore = source.readsCount;
  const bytesBefore = source.bytesRead;
  const lagMonitor = startLagMonitor();
  const start = now();
  const tiles: TileSource = createCachedTileSource(
    await GeoTiffImages.createTileSource(best),
    TILE_CACHE_MAX_BYTES,
  );
  const result = await readWindowRgba({
    tiles,
    format: await GeoTiffImages.detectPixelFormat(best),
    window: [0, 0, width, height],
    step,
  });
  const elapsed = now() - start;
  log(
    `Low zoom: whole image → ${result.width}x${result.height} px from ${width}x${height} (step ${step}) in ${formatMs(elapsed)}, file reads ${source.readsCount - readsBefore} (${formatMb(source.bytesRead - bytesBefore)}), JS thread blocked max ${formatMs(lagMonitor.stop())}`,
  );
};

const run = async ({
  fileUri,
  blockSize = DEFAULT_BLOCK_SIZE,
  maxBlocks,
  shouldStop = () => false,
  onLog,
  onProgress,
}: GeoTiffBenchmarkOptions): Promise<void> => {
  const log = (line: string) => onLog(line);
  logEnvironment(log);
  GeoTiffImages.registerDecoders();

  const openStart = now();
  const source = GeoTiffFileSource.open(fileUri);
  try {
    const tiff = await GeoTIFF.fromSource(source as any);
    const image = await tiff.getImage(0);
    log(
      `File: ${formatMb(source.fileSize)}; header read in ${formatMs(now() - openStart)} (${source.readsCount} reads, ${source.bytesRead} bytes)`,
    );
    await logImageInfo({ tiff, image, log });
    await logGeoreference(image, log);

    let format: PixelFormat;
    try {
      format = await GeoTiffImages.detectPixelFormat(image);
      log(
        `Pixel format: ${format.kind}${format.noData !== null && format.noData !== undefined ? `, no data ${format.noData}` : ""}`,
      );
    } catch (error: any) {
      log(`Not supported: ${error?.reason ?? String(error)}`);
      return;
    }
    await compareWithReadRgb({ image, format, blockSize, log });
    await benchmarkLowZoom({ tiff, source, blockSize, log });
    await benchmarkFullResolution({
      image,
      format,
      source,
      blockSize,
      maxBlocks,
      shouldStop,
      log,
      onProgress,
    });
  } finally {
    await source.close();
  }
};

export const GeoTiffBenchmark = {
  run,
};
