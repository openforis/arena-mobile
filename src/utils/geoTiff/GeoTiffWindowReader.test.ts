import {
  PixelFormat,
  TileSource,
  createCachedTileSource,
  readWindowRgba,
} from "./GeoTiffWindowReader";

const WIDTH = 50;
const HEIGHT = 37;

// sample value of the synthetic image
const sampleAt = (x: number, y: number, band: number): number =>
  (x * 7 + y * 13 + band * 50) % 256;

// splits the synthetic image into tiles (padded) or strips (last one shorter)
const createTileSource = ({
  spp,
  tileWidth,
  tileHeight,
  strips = false,
  sample = sampleAt,
}: {
  spp: number;
  tileWidth: number;
  tileHeight: number;
  strips?: boolean;
  sample?: (x: number, y: number, band: number) => number;
}): TileSource & { requests: string[] } => {
  const requests: string[] = [];
  return {
    width: WIDTH,
    height: HEIGHT,
    tileWidth,
    tileHeight,
    requests,
    getTile: async (tx, ty) => {
      requests.push(`${tx},${ty}`);
      const rows = strips
        ? Math.min(tileHeight, HEIGHT - ty * tileHeight)
        : tileHeight;
      const data = new Uint8Array(tileWidth * rows * spp);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < tileWidth; c++) {
          for (let b = 0; b < spp; b++) {
            const x = tx * tileWidth + c;
            const y = ty * tileHeight + r;
            data[(r * tileWidth + c) * spp + b] =
              x < WIDTH && y < HEIGHT ? sample(x, y, b) : 0;
          }
        }
      }
      return data;
    },
  };
};

const pixelAt = (
  result: { data: Uint8Array; width: number },
  ox: number,
  oy: number,
): number[] => {
  const i = (oy * result.width + ox) * 4;
  return Array.from(result.data.subarray(i, i + 4));
};

describe("readWindowRgba", () => {
  const rgb: PixelFormat = { kind: "rgb", samplesPerPixel: 3 };

  it.each([
    ["tiles", { tileWidth: 16, tileHeight: 16 }],
    ["strips", { tileWidth: WIDTH, tileHeight: 5, strips: true }],
  ])("reads a window across several %s", async (_, layout) => {
    const tiles = createTileSource({ spp: 3, ...layout });
    const result = await readWindowRgba({
      tiles,
      format: rgb,
      window: [10, 3, 45, 37],
    });
    expect(result.width).toBe(35);
    expect(result.height).toBe(34);
    for (const [ox, oy] of [
      [0, 0],
      [5, 12],
      [34, 33],
      [21, 30],
    ] as const) {
      const x = 10 + ox;
      const y = 3 + oy;
      expect(pixelAt(result, ox, oy)).toEqual([
        sampleAt(x, y, 0),
        sampleAt(x, y, 1),
        sampleAt(x, y, 2),
        255,
      ]);
    }
  });

  it("decimates the window taking one pixel every `step`", async () => {
    const tiles = createTileSource({ spp: 3, tileWidth: 16, tileHeight: 16 });
    const result = await readWindowRgba({
      tiles,
      format: rgb,
      window: [1, 2, 50, 37],
      step: 4,
    });
    expect(result.width).toBe(13);
    expect(result.height).toBe(9);
    for (let oy = 0; oy < result.height; oy++) {
      for (let ox = 0; ox < result.width; ox++) {
        const x = 1 + ox * 4;
        const y = 2 + oy * 4;
        expect(pixelAt(result, ox, oy).slice(0, 3)).toEqual([
          sampleAt(x, y, 0),
          sampleAt(x, y, 1),
          sampleAt(x, y, 2),
        ]);
      }
    }
  });

  it("reads only the tiles intersecting the window", async () => {
    const tiles = createTileSource({ spp: 3, tileWidth: 16, tileHeight: 16 });
    await readWindowRgba({ tiles, format: rgb, window: [17, 17, 20, 40] });
    expect(tiles.requests.sort()).toEqual(["1,1", "1,2"]);
  });

  it("copies RGBA and converts gray, palette and YCbCr pixels", async () => {
    const read = async (format: PixelFormat, spp: number, sample = sampleAt) =>
      pixelAt(
        await readWindowRgba({
          tiles: createTileSource({ spp, tileWidth: 8, tileHeight: 8, sample }),
          format,
          window: [3, 4, 4, 5],
        }),
        0,
        0,
      );
    const [s0, s1, s2, s3] = [0, 1, 2, 3].map((b) => sampleAt(3, 4, b));
    expect(await read({ kind: "rgba", samplesPerPixel: 4 }, 4)).toEqual([
      s0,
      s1,
      s2,
      s3,
    ]);
    expect(await read({ kind: "gray", samplesPerPixel: 1 }, 1)).toEqual([
      s0,
      s0,
      s0,
      255,
    ]);
    expect(
      await read({ kind: "gray", samplesPerPixel: 1, whiteIsZero: true }, 1),
    ).toEqual([255 - s0!, 255 - s0!, 255 - s0!, 255]);
    expect(await read({ kind: "grayAlpha", samplesPerPixel: 2 }, 2)).toEqual([
      s0,
      s0,
      s0,
      s1,
    ]);
    const colorMap = new Uint8Array(256 * 3).map((_, i) => (i * 3) % 256);
    expect(
      await read({ kind: "palette", samplesPerPixel: 1, colorMap }, 1),
    ).toEqual([
      colorMap[s0! * 3],
      colorMap[s0! * 3 + 1],
      colorMap[s0! * 3 + 2],
      255,
    ]);
    // Y 100, Cb 128, Cr 128: gray
    expect(
      await read({ kind: "ycbcr", samplesPerPixel: 3 }, 3, (_x, _y, b) =>
        b === 0 ? 100 : 128,
      ),
    ).toEqual([100, 100, 100, 255]);
  });

  it("makes the no data pixels transparent", async () => {
    const result = await readWindowRgba({
      tiles: createTileSource({
        spp: 1,
        tileWidth: 8,
        tileHeight: 8,
        sample: (x) => (x === 2 ? 0 : 99),
      }),
      format: { kind: "gray", samplesPerPixel: 1, noData: 0 },
      window: [1, 0, 4, 1],
    });
    expect(pixelAt(result, 0, 0)[3]).toBe(255);
    expect(pixelAt(result, 1, 0)[3]).toBe(0);
    expect(pixelAt(result, 2, 0)[3]).toBe(255);
  });
});

describe("createCachedTileSource", () => {
  it("decodes a strip shared by several windows only once", async () => {
    const source = createTileSource({
      spp: 3,
      tileWidth: WIDTH,
      tileHeight: 4,
      strips: true,
    });
    const cached = createCachedTileSource(source, 1_000_000);
    const format: PixelFormat = { kind: "rgb", samplesPerPixel: 3 };
    for (const x of [0, 16, 32]) {
      await readWindowRgba({
        tiles: cached,
        format,
        window: [x, 0, x + 16, 16],
      });
    }
    expect(source.requests).toEqual(["0,0", "0,1", "0,2", "0,3"]);
    expect(cached.decodedCount()).toBe(4);
  });

  it("evicts the least recently used tiles above the size budget", async () => {
    const source = createTileSource({ spp: 1, tileWidth: 10, tileHeight: 10 });
    // 100 bytes per tile: room for 2 tiles
    const cached = createCachedTileSource(source, 200);
    for (const [tx, ty] of [
      [0, 0],
      [1, 0],
      [0, 0],
      [2, 0],
      [1, 0],
      [0, 0],
    ] as const) {
      await cached.getTile(tx, ty);
    }
    // 1,0 evicted when 2,0 was added (0,0 was more recent)
    expect(source.requests).toEqual(["0,0", "1,0", "2,0", "1,0", "0,0"]);
    expect(cached.cachedBytes()).toBeLessThanOrEqual(200);
  });
});
