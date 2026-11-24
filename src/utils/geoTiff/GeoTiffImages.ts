import {
  BaseDecoder,
  GeoTIFF,
  GeoTIFFImage,
  addDecoder,
  getDecoder,
  globals,
} from "geotiff";

import { PromiseUtils } from "utils/PromiseUtils";

import { decompressLzw } from "./lzw";
import { PixelFormat, TileSource } from "./GeoTiffWindowReader";

// compression codes (TIFF tag 259) decoded on Hermes (no WebAssembly: no LERC, Zstandard)
const COMPRESSION = {
  none: 1,
  lzw: 5,
  jpeg: 7,
  deflate: 8,
  deflateAdobe: 32946,
  packBits: 32773,
};
const SUPPORTED_COMPRESSIONS = new Set(Object.values(COMPRESSION));

const PHOTOMETRIC = {
  whiteIsZero: 0,
  blackIsZero: 1,
  rgb: 2,
  palette: 3,
  ycbcr: 6,
};

// decoding runs on the JS thread: let it update the UI at least this often
const MAX_BUSY_MS = 50;

// ExtraSamples: associated or unassociated alpha
const ALPHA_EXTRA_SAMPLES = new Set([1, 2]);

export class GeoTiffUnsupportedError extends Error {
  constructor(readonly reason: string) {
    super(`GeoTIFF not supported: ${reason}`);
    this.name = "GeoTiffUnsupportedError";
  }
}

const sum = (values: ArrayLike<number> | number): number =>
  typeof values === "number"
    ? values
    : Array.from(values).reduce((acc, value) => acc + value, 0);

class LzwDecoder extends BaseDecoder {
  override decodeBlock(buffer: ArrayBufferLike): ArrayBufferLike {
    const { tileWidth, tileHeight, bitsPerSample } = this.parameters;
    const decoded = decompressLzw(
      buffer,
      (tileWidth * tileHeight * sum(bitsPerSample)) / 8,
    );
    return decoded.buffer.slice(
      decoded.byteOffset,
      decoded.byteOffset + decoded.byteLength,
    );
  }
}

let decodersRegistered = false;

const registerDecoders = (): void => {
  if (decodersRegistered) return;
  addDecoder(COMPRESSION.lzw, () =>
    Promise.resolve(LzwDecoder as unknown as typeof BaseDecoder),
  );
  decodersRegistered = true;
};

const loadValue = <T extends globals.TagName>(image: GeoTIFFImage, tag: T) =>
  image.fileDirectory.loadValue(tag);

const getCompression = async (image: GeoTIFFImage): Promise<number> =>
  (await loadValue(image, "Compression")) ?? COMPRESSION.none;

// TIFF ColorMap: 16 bit values, all the reds, then the greens, then the blues
const toColorMap8 = (colorMap: ArrayLike<number>): Uint8Array => {
  const count = colorMap.length / 3;
  const result = new Uint8Array(256 * 3);
  for (let i = 0; i < Math.min(count, 256); i++) {
    result[i * 3] = colorMap[i]! >> 8;
    result[i * 3 + 1] = colorMap[count + i]! >> 8;
    result[i * 3 + 2] = colorMap[2 * count + i]! >> 8;
  }
  return result;
};

// throws when the samples are not 8 bit unsigned integers, interleaved (chunky)
const checkSamples = async (image: GeoTIFFImage): Promise<void> => {
  const samplesPerPixel = image.getSamplesPerPixel();
  const bitsPerSample = Array.from({ length: samplesPerPixel }, (_, i) =>
    image.getBitsPerSample(i),
  );
  const otherBits = bitsPerSample.find((bits) => bits !== 8);
  if (otherBits !== undefined) {
    throw new GeoTiffUnsupportedError(`${otherBits} bits per sample`);
  }
  const sampleFormat: number[] = Array.from(
    (await loadValue(image, "SampleFormat")) ?? [],
  );
  if (sampleFormat.some((format) => format !== 1)) {
    throw new GeoTiffUnsupportedError("sample format not unsigned integer");
  }
  const planarConfiguration = await loadValue(image, "PlanarConfiguration");
  if (samplesPerPixel > 1 && planarConfiguration === 2) {
    throw new GeoTiffUnsupportedError("planar configuration (separate bands)");
  }
};

const toPixelFormat = async ({
  image,
  photometric,
  compression,
  hasAlpha,
}: {
  image: GeoTIFFImage;
  photometric: number | undefined;
  compression: number;
  hasAlpha: boolean;
}): Promise<PixelFormat | null> => {
  const samplesPerPixel = image.getSamplesPerPixel();
  const base = { samplesPerPixel, noData: image.getGDALNoData() };
  switch (photometric) {
    case PHOTOMETRIC.whiteIsZero:
    case PHOTOMETRIC.blackIsZero:
      return {
        ...base,
        kind: samplesPerPixel > 1 && hasAlpha ? "grayAlpha" : "gray",
        whiteIsZero: photometric === PHOTOMETRIC.whiteIsZero,
      };
    case PHOTOMETRIC.rgb:
      if (samplesPerPixel < 3) return null;
      return {
        ...base,
        kind: samplesPerPixel > 3 && hasAlpha ? "rgba" : "rgb",
      };
    case PHOTOMETRIC.palette:
      return {
        ...base,
        kind: "palette",
        colorMap: toColorMap8(
          (await loadValue(image, "ColorMap")) as ArrayLike<number>,
        ),
      };
    case PHOTOMETRIC.ycbcr:
      // only JPEG: the JPEG decoder gives full resolution YCbCr pixels
      return compression === COMPRESSION.jpeg
        ? { ...base, kind: "ycbcr" }
        : null;
    default:
      return null;
  }
};

const detectPixelFormat = async (image: GeoTIFFImage): Promise<PixelFormat> => {
  const compression = await getCompression(image);
  if (!SUPPORTED_COMPRESSIONS.has(compression)) {
    throw new GeoTiffUnsupportedError(`compression ${compression}`);
  }
  await checkSamples(image);
  const photometric = await loadValue(image, "PhotometricInterpretation");
  const extraSamples: number[] = Array.from(
    (await loadValue(image, "ExtraSamples")) ?? [],
  );
  const format = await toPixelFormat({
    image,
    photometric,
    compression,
    hasAlpha: ALPHA_EXTRA_SAMPLES.has(extraSamples[0] ?? 0),
  });
  if (!format) {
    throw new GeoTiffUnsupportedError(
      `photometric interpretation ${photometric} with ${image.getSamplesPerPixel()} samples per pixel`,
    );
  }
  return format;
};

// resolves after a macrotask when the JS thread has been busy for more than maxBusyMs
export const createTimeSlicer = (maxBusyMs = MAX_BUSY_MS) => {
  let lastYield = Date.now();
  return async (): Promise<void> => {
    if (Date.now() - lastYield < maxBusyMs) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    lastYield = Date.now();
  };
};

const createTileSource = async (image: GeoTIFFImage): Promise<TileSource> => {
  registerDecoders();
  const tileWidth = image.getTileWidth();
  const tileHeight = image.getTileHeight();
  const decoder = await getDecoder(await getCompression(image), {
    tileWidth,
    tileHeight,
    planarConfiguration: 1,
    bitsPerSample: await loadValue(image, "BitsPerSample"),
    predictor: (await loadValue(image, "Predictor")) ?? 1,
    // used by the JPEG decoder
    JPEGTables: await loadValue(image, "JPEGTables"),
  } as Parameters<typeof getDecoder>[1]);
  const yieldIfBusy = createTimeSlicer();
  // one tile at a time, so that the UI can be updated between two decodings
  const enqueue = PromiseUtils.createSerialQueue();
  const decodeTile = async (tileX: number, tileY: number) => {
    await yieldIfBusy();
    const { data } = await image.getTileOrStrip(tileX, tileY, 0, decoder);
    return new Uint8Array(data as ArrayBuffer);
  };
  return {
    width: image.getWidth(),
    height: image.getHeight(),
    tileWidth,
    tileHeight,
    getTile: (tileX, tileY) => enqueue(() => decodeTile(tileX, tileY)),
  };
};

// NewSubfileType flags
const SUBFILE_REDUCED_RESOLUTION = 1;
const SUBFILE_MASK = 4;

// full resolution image, then its overviews (largest first); transparency masks are excluded
const getLevels = async (tiff: GeoTIFF): Promise<GeoTIFFImage[]> => {
  const count = await tiff.getImageCount();
  const images = await Promise.all(
    Array.from({ length: count }, (_, index) => tiff.getImage(index)),
  );
  const subfileTypes: number[] = await Promise.all(
    images.map(
      async (image) => (await loadValue(image, "NewSubfileType")) ?? 0,
    ),
  );
  const [fullResolution] = images;
  if (!fullResolution) return [];
  const overviews = images
    .filter(
      (image, index) =>
        index > 0 &&
        (subfileTypes[index]! & SUBFILE_REDUCED_RESOLUTION) !== 0 &&
        (subfileTypes[index]! & SUBFILE_MASK) === 0 &&
        image.getSamplesPerPixel() === fullResolution.getSamplesPerPixel() &&
        image.getWidth() < fullResolution.getWidth(),
    )
    .sort((a, b) => b.getWidth() - a.getWidth());
  return [fullResolution, ...overviews];
};

export const GeoTiffImages = {
  getLevels,
  registerDecoders,
  detectPixelFormat,
  createTileSource,
};
