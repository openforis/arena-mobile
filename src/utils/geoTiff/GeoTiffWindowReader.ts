// Assembles a window of a GeoTIFF image into an RGBA buffer, copying the decoded tiles/strips
// (geotiff.js readRGB reads every sample through a DataView: several times slower without a JIT)

export type PixelFormatKind =
  "rgb" | "rgba" | "gray" | "grayAlpha" | "palette" | "ycbcr";

export type PixelFormat = {
  kind: PixelFormatKind;
  samplesPerPixel: number;
  // gray: 0 is white (PhotometricInterpretation 0)
  whiteIsZero?: boolean;
  // palette: RGB triples (8 bit) by index
  colorMap?: Uint8Array;
  // value of the "no data" pixels (transparent), single value for all the bands
  noData?: number | null;
};

// decoded tiles or strips (chunky, 8 bits per sample)
export type TileSource = {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  getTile: (tileX: number, tileY: number) => Promise<Uint8Array>;
};

export type Window = [x0: number, y0: number, x1: number, y1: number];

export type RgbaWindow = { data: Uint8Array; width: number; height: number };

const clampByte = (value: number): number =>
  value < 0 ? 0 : value > 255 ? 255 : value;

// converts `count` pixels from src (srcStep samples apart) into RGBA
type RowConverter = (
  src: Uint8Array,
  srcIndex: number,
  srcStep: number,
  out: Uint8Array,
  outIndex: number,
  count: number,
) => void;

const createRowConverter = (format: PixelFormat): RowConverter => {
  const { kind, whiteIsZero, colorMap } = format;
  const noData = format.noData ?? -1;
  switch (kind) {
    case "rgb":
      return (src, s, step, out, d, count) => {
        for (let i = 0; i < count; i++, s += step, d += 4) {
          const r = src[s]!;
          const g = src[s + 1]!;
          const b = src[s + 2]!;
          out[d] = r;
          out[d + 1] = g;
          out[d + 2] = b;
          out[d + 3] = r === noData && g === noData && b === noData ? 0 : 255;
        }
      };
    case "rgba":
      return (src, s, step, out, d, count) => {
        for (let i = 0; i < count; i++, s += step, d += 4) {
          out[d] = src[s]!;
          out[d + 1] = src[s + 1]!;
          out[d + 2] = src[s + 2]!;
          out[d + 3] = src[s + 3]!;
        }
      };
    case "gray":
    case "grayAlpha": {
      const hasAlpha = kind === "grayAlpha";
      return (src, s, step, out, d, count) => {
        for (let i = 0; i < count; i++, s += step, d += 4) {
          const raw = src[s]!;
          const value = whiteIsZero ? 255 - raw : raw;
          out[d] = value;
          out[d + 1] = value;
          out[d + 2] = value;
          out[d + 3] = hasAlpha ? src[s + 1]! : raw === noData ? 0 : 255;
        }
      };
    }
    case "palette": {
      const map = colorMap!;
      return (src, s, step, out, d, count) => {
        for (let i = 0; i < count; i++, s += step, d += 4) {
          const index = src[s]!;
          const m = index * 3;
          out[d] = map[m]!;
          out[d + 1] = map[m + 1]!;
          out[d + 2] = map[m + 2]!;
          out[d + 3] = index === noData ? 0 : 255;
        }
      };
    }
    case "ycbcr":
      return (src, s, step, out, d, count) => {
        for (let i = 0; i < count; i++, s += step, d += 4) {
          const y = src[s]!;
          const cb = src[s + 1]! - 128;
          const cr = src[s + 2]! - 128;
          out[d] = clampByte(y + 1.402 * cr);
          out[d + 1] = clampByte(y - 0.34414 * cb - 0.71414 * cr);
          out[d + 2] = clampByte(y + 1.772 * cb);
          out[d + 3] = 255;
        }
      };
  }
};

// reads the window [x0, y0, x1, y1) taking one pixel every `step` pixels (decimation, for low zooms)
export const readWindowRgba = async ({
  tiles,
  format,
  window,
  step = 1,
}: {
  tiles: TileSource;
  format: PixelFormat;
  window: Window;
  step?: number;
}): Promise<RgbaWindow> => {
  const [x0, y0, x1, y1] = window;
  const width = Math.ceil((x1 - x0) / step);
  const height = Math.ceil((y1 - y0) / step);
  const out = new Uint8Array(width * height * 4);
  const { tileWidth: tw, tileHeight: th } = tiles;
  const spp = format.samplesPerPixel;
  const convertRow = createRowConverter(format);
  const copyRgbaRows = format.kind === "rgba" && step === 1;

  const jobs: Promise<void>[] = [];
  for (let ty = Math.floor(y0 / th); ty * th < y1; ty++) {
    for (let tx = Math.floor(x0 / tw); tx * tw < x1; tx++) {
      jobs.push(
        tiles.getTile(tx, ty).then((src) => {
          // last strip can be shorter than the others
          const tileRows = Math.min(th, Math.floor(src.length / (tw * spp)));
          // output columns/rows whose source pixel falls in this tile
          const ox0 = Math.max(0, Math.ceil((tx * tw - x0) / step));
          const ox1 = Math.min(width, Math.ceil(((tx + 1) * tw - x0) / step));
          const oy0 = Math.max(0, Math.ceil((ty * th - y0) / step));
          const oy1 = Math.min(
            height,
            Math.ceil((ty * th + tileRows - y0) / step),
          );
          const count = ox1 - ox0;
          if (count <= 0) return;
          for (let oy = oy0; oy < oy1; oy++) {
            const sy = y0 + oy * step - ty * th;
            const sx = x0 + ox0 * step - tx * tw;
            const srcIndex = (sy * tw + sx) * spp;
            const outIndex = (oy * width + ox0) * 4;
            if (copyRgbaRows) {
              out.set(src.subarray(srcIndex, srcIndex + count * 4), outIndex);
            } else {
              convertRow(src, srcIndex, spp * step, out, outIndex, count);
            }
          }
        }),
      );
    }
  }
  await Promise.all(jobs);
  return { data: out, width, height };
};

// keeps the most recently used decoded tiles/strips within a size budget:
// a full-width strip is shared by all the blocks of a row of blocks
export const createCachedTileSource = (
  source: TileSource,
  maxBytes: number,
): TileSource & { cachedBytes: () => number; decodedCount: () => number } => {
  const cache = new Map<
    string,
    { promise: Promise<Uint8Array>; size: number }
  >();
  let cachedBytes = 0;
  let decodedCount = 0;
  const evict = () => {
    for (const [key, entry] of cache) {
      if (cachedBytes <= maxBytes || cache.size <= 1) break;
      cache.delete(key);
      cachedBytes -= entry.size;
    }
  };
  return {
    ...source,
    getTile: (tileX, tileY) => {
      const key = `${tileX},${tileY}`;
      const cached = cache.get(key);
      if (cached) {
        // most recently used: move to the end
        cache.delete(key);
        cache.set(key, cached);
        return cached.promise;
      }
      decodedCount += 1;
      const entry = { promise: source.getTile(tileX, tileY), size: 0 };
      cache.set(key, entry);
      entry.promise.then(
        (data) => {
          if (cache.get(key) !== entry) return;
          entry.size = data.length;
          cachedBytes += data.length;
          evict();
        },
        () => cache.delete(key),
      );
      return entry.promise;
    },
    cachedBytes: () => cachedBytes,
    decodedCount: () => decodedCount,
  };
};
