import path from "node:path";

import { GEOTIFF_FIXTURES_DIR } from "utils/geoTiff/nodeFileSystem.testUtils";

import { GeoTiffBenchmark } from "./geoTiffBenchmark";

jest.mock("expo-file-system", () =>
  jest.requireActual("utils/geoTiff/nodeFileSystem.testUtils"),
);
jest.mock("react-native", () => ({
  Platform: { OS: "android", Version: 35 },
}));

(globalThis as any).__DEV__ = false;

const runBenchmark = async (fileName: string, maxBlocks?: number) => {
  const lines: string[] = [];
  const progress: number[] = [];
  await GeoTiffBenchmark.run({
    fileUri: path.join(GEOTIFF_FIXTURES_DIR, fileName),
    blockSize: 16,
    maxBlocks,
    onLog: (line) => lines.push(line),
    onProgress: (done, total) => progress.push(done / total),
  });
  return { lines, progress };
};

describe("GeoTiffBenchmark", () => {
  it("reports georeference and decoding timings", async () => {
    const { lines, progress } = await runBenchmark("rgb_lzw_strips.tif");
    const report = lines.join("\n");
    expect(report).toContain("Image: 40x30 px, 3 samples x 8 bits");
    expect(report).toContain("+proj=tmerc");
    expect(report).toContain("Pixel format: rgb");
    expect(report).toMatch(/First block: fast path .*, geotiff.js readRGB/);
    expect(report).toMatch(/Low zoom: whole image → /);
    expect(report).toMatch(/Full resolution: 6 blocks, 0.0 Mpx in .* Mpx\/s/);
    expect(progress[progress.length - 1]).toBe(1);
  });

  it("estimates the whole image time when stopped after some blocks", async () => {
    const { lines } = await runBenchmark("rgb_deflate_tiled.tif", 2);
    expect(lines.join("\n")).toMatch(/Full resolution: 2 blocks/);
    expect(lines.join("\n")).toContain("whole image estimate");
  });

  it("warns about an unknown datum shift", async () => {
    const { lines } = await runBenchmark("osgb36_27700.tif");
    expect(lines.join("\n")).toContain("datum shift to WGS84 unknown");
  });

  it("stops at unsupported pixel formats", async () => {
    const { lines } = await runBenchmark("uint16.tif");
    expect(lines.join("\n")).toContain("Not supported: 16 bits per sample");
    expect(lines.join("\n")).not.toContain("Full resolution");
  });
});
