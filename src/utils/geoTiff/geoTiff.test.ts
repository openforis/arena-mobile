import fs from "node:fs";
import path from "node:path";

import { GeoTIFF } from "geotiff";

import { GeoTiffFileSource } from "./GeoTiffFileSource";
import { GeoTiffGeoreference } from "./GeoTiffGeoreference";
import { GeoTiffImages, GeoTiffUnsupportedError } from "./GeoTiffImages";
import { readWindowRgba } from "./GeoTiffWindowReader";
import { GEOTIFF_FIXTURES_DIR } from "./nodeFileSystem.testUtils";

jest.mock("expo-file-system", () =>
  jest.requireActual("./nodeFileSystem.testUtils"),
);

const FIXTURES_DIR = GEOTIFF_FIXTURES_DIR;

type Expected = {
  corners: [number, number][] | null;
  pixels?: { x: number; y: number; rgba: number[] }[];
};
const expectedByFile: Record<string, Expected> = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "expected.json"), "utf8"),
);

const openImage = async (fileName: string) => {
  const source = GeoTiffFileSource.open(path.join(FIXTURES_DIR, fileName));
  const tiff = await GeoTIFF.fromSource(source as any);
  return { source, tiff, image: await tiff.getImage(0) };
};

const metersBetween = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
): number => {
  const k = Math.PI / 180;
  const dx = (lon2 - lon1) * k * Math.cos(((lat1 + lat2) / 2) * k);
  const dy = (lat2 - lat1) * k;
  return Math.hypot(dx, dy) * 6371008;
};

const readCorners = async (fileName: string) => {
  const { image, source } = await openImage(fileName);
  try {
    const pixelToCrs = await GeoTiffGeoreference.getPixelToCrs(image);
    const crs = GeoTiffGeoreference.getCrs(image);
    if (!pixelToCrs || !crs) return null;
    const width = image.getWidth();
    const height = image.getHeight();
    const corners = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ].map(([column, row]): [number, number] => {
      const { latitude, longitude } = crs.toLatLng(
        ...pixelToCrs(column!, row!),
      );
      return [latitude, longitude];
    });
    return { corners, crs };
  } finally {
    await source.close();
  }
};

describe("GeoTIFF georeference (vs GDAL)", () => {
  it.each([
    "rgb_lzw_strips.tif",
    "gray_nodata_4326.tif",
    "rotated.tif",
    "ed50_utm.tif",
    "user_defined_lcc.tif",
  ])("places the corners of %s", async (fileName) => {
    const result = await readCorners(fileName);
    const expected = expectedByFile[fileName]!.corners!;
    expect(result!.crs.datumShiftKnown).toBe(true);
    result!.corners.forEach((corner, index) => {
      expect(metersBetween(corner, expected[index]!)).toBeLessThan(0.01);
    });
  });

  it("reports the unknown datum shift of EPSG:27700 (OSGB36)", async () => {
    const result = await readCorners("osgb36_27700.tif");
    const expected = expectedByFile["osgb36_27700.tif"]!.corners!;
    expect(result!.crs.datumShiftKnown).toBe(false);
    // without the datum shift the map is ~100 m off
    expect(metersBetween(result!.corners[0]!, expected[0]!)).toBeGreaterThan(
      50,
    );
  });

  it("detects a TIFF without georeference", async () => {
    expect(await readCorners("no_georeference.tif")).toBeNull();
  });
});

describe("GeoTIFF pixels (vs GDAL)", () => {
  it.each([
    ["rgb_lzw_strips.tif", 0],
    ["rgb_deflate_tiled.tif", 0],
    ["rgb_packbits.tif", 0],
    ["rgba.tif", 0],
    ["gray_nodata_4326.tif", 0],
    ["palette.tif", 0],
    // JPEG: chroma upsampling differs from libjpeg
    ["rgb_jpeg_ycbcr.tif", 12],
  ])("reads the pixels of %s", async (fileName, tolerance) => {
    const { image, source } = await openImage(fileName);
    try {
      const format = await GeoTiffImages.detectPixelFormat(image);
      const window = await readWindowRgba({
        tiles: await GeoTiffImages.createTileSource(image),
        format,
        window: [0, 0, image.getWidth(), image.getHeight()],
      });
      for (const { x, y, rgba } of expectedByFile[fileName]!.pixels!) {
        const index = (y * window.width + x) * 4;
        const actual = Array.from(window.data.subarray(index, index + 4));
        actual.forEach((value, band) => {
          expect(Math.abs(value - rgba[band]!)).toBeLessThanOrEqual(tolerance);
        });
      }
    } finally {
      await source.close();
    }
  });

  it("rejects images with more than 8 bits per sample", async () => {
    const { image, source } = await openImage("uint16.tif");
    await expect(GeoTiffImages.detectPixelFormat(image)).rejects.toThrow(
      GeoTiffUnsupportedError,
    );
    await source.close();
  });
});
