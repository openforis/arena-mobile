import fs from "node:fs";
import path from "node:path";

import { GeoPdfTilePlanner } from "utils/GeoPdfTilePlanner";
import { GeoPdfTransform } from "utils/GeoPdfTransform";
import { GEOTIFF_FIXTURES_DIR } from "utils/geoTiff/nodeFileSystem.testUtils";

import { GeoTiffMaps } from "./geoTiffMaps";
import { ImportedMapRenderer } from "./ImportedMapRenderer";

jest.mock("expo-file-system", () =>
  jest.requireActual("utils/geoTiff/nodeFileSystem.testUtils"),
);
jest.mock("utils/Logger", () => ({
  log: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock("./ImportedMapRenderer", () => ({
  ImportedMapRenderer: {
    renderImageTiles: jest.fn(async () => ({ written: 1, bytes: 100 })),
  },
}));

type Expected = {
  corners: [number, number][];
  pixels: { x: number; y: number; rgba: number[] }[];
};
const expectedByFile: Record<string, Expected> = JSON.parse(
  fs.readFileSync(path.join(GEOTIFF_FIXTURES_DIR, "expected.json"), "utf8"),
);

const fixtureUri = (fileName: string) =>
  path.join(GEOTIFF_FIXTURES_DIR, fileName);

const renderImageTiles = ImportedMapRenderer.renderImageTiles as jest.Mock;

describe("GeoTiffMaps.analyze", () => {
  it("computes the georeference of a GeoTIFF", async () => {
    const { georeference } = await GeoTiffMaps.analyze(
      fixtureUri("rgb_lzw_strips.tif"),
    );
    expect(georeference!.datumCompatible).toBe(true);
    const [lat, lng] = expectedByFile["rgb_lzw_strips.tif"]!.corners[2]!;
    expect(georeference!.neatline[2]!.latitude).toBeCloseTo(lat, 7);
    expect(georeference!.neatline[2]!.longitude).toBeCloseTo(lng, 7);
    // 10 m pixels at 42° N: zoom 14 (~7 m per tile pixel)
    expect(GeoTiffMaps.computeZoomRange(georeference!).nativeZoom).toBe(14);
  });

  it("reports unsupported formats and missing georeference", async () => {
    expect(await GeoTiffMaps.analyze(fixtureUri("uint16.tif"))).toEqual({
      georeference: null,
      unsupportedFormat: "16 bits per sample",
    });
    expect(
      await GeoTiffMaps.analyze(fixtureUri("no_georeference.tif")),
    ).toEqual({ georeference: null });
  });
});

describe("GeoTiffMaps.createBlockRenderer", () => {
  it.each(["rgb_deflate_tiled.tif", "rotated.tif"])(
    "sends to the native renderer the pixels of %s placed where GDAL places them",
    async (fileName) => {
      renderImageTiles.mockClear();
      const { georeference } = await GeoTiffMaps.analyze(fixtureUri(fileName));
      const zoom = 17;
      const blocks = GeoPdfTilePlanner.planRenderBlocks({
        georeference: georeference!,
        zoom,
      });
      const renderer = await GeoTiffMaps.createBlockRenderer(
        fixtureUri(fileName),
      );
      for (const block of blocks) {
        await renderer.renderBlock(block, "/tiles");
      }
      await renderer.close();
      expect(renderImageTiles).toHaveBeenCalledTimes(blocks.length);

      const expected = expectedByFile[fileName]!;
      const [cornerLat, cornerLng] = expected.corners[0]!;
      const expectedWorldPixel = GeoPdfTransform.mercatorToWorldPixel(
        GeoPdfTransform.latLngToMercator({
          latitude: cornerLat,
          longitude: cornerLng,
        }),
        zoom,
      );
      // the block containing the top-left corner of the image (window starting at pixel 0, 0)
      const callIndex = renderImageTiles.mock.calls.findIndex(([, options]) => {
        const p = GeoPdfTransform.applyAffine(options.matrix, { x: 0, y: 0 });
        return p.x >= 0 && p.y >= 0 && p.x < 1024 && p.y < 1024;
      });
      const [pixels, options] = renderImageTiles.mock.calls[callIndex]!;
      expect(pixels.length).toBe(
        options.pixelsWidth * options.pixelsHeight * 4,
      );
      const block = blocks[callIndex]!;
      const { tile, col, row } = block.tiles[0]!;
      const blockOrigin = {
        x: (tile.x - col) * GeoPdfTransform.TILE_SIZE,
        y: (tile.y - row) * GeoPdfTransform.TILE_SIZE,
      };
      const cornerInBlock = GeoPdfTransform.applyAffine(options.matrix, {
        x: 0,
        y: 0,
      });
      expect(
        Math.hypot(
          blockOrigin.x + cornerInBlock.x - expectedWorldPixel.x,
          blockOrigin.y + cornerInBlock.y - expectedWorldPixel.y,
        ),
      ).toBeLessThan(1.5);
      // first pixel of the window = first pixel of the image
      expect(Array.from(pixels.subarray(0, 4))).toEqual(
        expected.pixels.find(({ x, y }) => x === 0 && y === 0)!.rgba,
      );
    },
  );
});
