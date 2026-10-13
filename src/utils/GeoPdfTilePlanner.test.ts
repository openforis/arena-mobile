import { GeoPdfParser } from "./GeoPdfParser";
import { GeoPdfTilePlanner } from "./GeoPdfTilePlanner";
import { GeoPdfTransform } from "./GeoPdfTransform";
import { buildGeoPdf } from "./geoPdfFixtures.testUtils";

const gpts = [45.0, 7.0, 45.1, 7.0, 45.1, 7.15, 45.0, 7.15];

const parseFirstPage = async (rotate = 0) => {
  const bytes = await buildGeoPdf([
    {
      size: [600, 800],
      rotate,
      viewports: [{ bbox: [50, 100, 550, 700], gpts }],
    },
  ]);
  const info = await GeoPdfParser.parse(bytes);
  const page = info.pages[0]!;
  return { page, viewport: page.viewports[0]! };
};

describe("GeoPdfTilePlanner", () => {
  test.each([0, 90, 180, 270])(
    "georeference maps the map corners to their coordinates (rotation %i)",
    async (rotate) => {
      const { page, viewport } = await parseFirstPage(rotate);
      const georeference = GeoPdfTilePlanner.computeGeoreference({
        page,
        viewport,
      })!;
      expect(georeference).not.toBeNull();
      georeference.neatline.forEach((latLng, index) => {
        const expected = viewport.controlPoints[index]!.latLng;
        expect(latLng.latitude).toBeCloseTo(expected.latitude, 9);
        expect(latLng.longitude).toBeCloseTo(expected.longitude, 9);
      });
      // the neatline is inside the displayed page
      const { width, height } = GeoPdfTransform.getDisplaySize(page);
      georeference.neatlineDisplay.forEach(({ x, y }) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(height);
      });
    },
  );

  test("zoom range", async () => {
    const { page, viewport } = await parseFirstPage();
    const georeference = GeoPdfTilePlanner.computeGeoreference({
      page,
      viewport,
    })!;
    const { nativeZoom, minZoom, maxZoom } =
      GeoPdfTilePlanner.computeZoomRange(georeference);
    // 0.15 degrees of longitude on 500 points rendered at 200 dpi (~1389 px): ~8 m/px -> zoom ~14
    expect(nativeZoom).toBe(14);
    expect(maxZoom).toBe(nativeZoom);
    // the whole map (~16.7 km in mercator meters) fits in 512 px at zoom 12 (~38 m/px)
    expect(minZoom).toBe(12);
  });

  test("render blocks place the map in the right tiles", async () => {
    const { page, viewport } = await parseFirstPage(90);
    const georeference = GeoPdfTilePlanner.computeGeoreference({
      page,
      viewport,
    })!;
    const zoom = 14;
    const blocks = GeoPdfTilePlanner.planRenderBlocks({ georeference, zoom });
    const tilesCount = GeoPdfTilePlanner.countTiles({
      neatline: georeference.neatline,
      minZoom: zoom,
      maxZoom: zoom,
    });
    expect(blocks.flatMap((block) => block.tiles)).toHaveLength(tilesCount);

    // a point of the map (center) must be rendered at its world pixel position
    const center = { latitude: 45.05, longitude: 7.075 };
    const centerWorldPixel = GeoPdfTransform.mercatorToWorldPixel(
      GeoPdfTransform.latLngToMercator(center),
      zoom,
    );
    const centerDisplay = GeoPdfTransform.applyHomography(
      georeference.mercatorToDisplay,
      GeoPdfTransform.latLngToMercator(center),
    );
    const tileX = Math.floor(centerWorldPixel.x / 256);
    const tileY = Math.floor(centerWorldPixel.y / 256);
    const block = blocks.find((item) =>
      item.tiles.some(({ tile }) => tile.x === tileX && tile.y === tileY),
    )!;
    expect(block).toBeDefined();
    const blockTile = block.tiles.find(
      ({ tile }) => tile.x === tileX && tile.y === tileY,
    )!;
    const blockOriginX = (tileX - blockTile.col) * 256;
    const blockOriginY = (tileY - blockTile.row) * 256;
    const rendered = GeoPdfTransform.applyAffine(block.matrix, centerDisplay);
    expect(rendered.x + blockOriginX).toBeCloseTo(centerWorldPixel.x, 1);
    expect(rendered.y + blockOriginY).toBeCloseTo(centerWorldPixel.y, 1);
  });

  test("overview tiles go from the highest zoom to the lowest", async () => {
    const { page, viewport } = await parseFirstPage();
    const georeference = GeoPdfTilePlanner.computeGeoreference({
      page,
      viewport,
    })!;
    const tiles = GeoPdfTilePlanner.planOverviewTiles({
      neatline: georeference.neatline,
      minZoom: 11,
      maxZoom: 14,
    });
    expect(tiles[0]!.z).toBe(13);
    expect(tiles.at(-1)!.z).toBe(11);
    expect(tiles).toHaveLength(
      GeoPdfTilePlanner.countTiles({
        neatline: georeference.neatline,
        minZoom: 11,
        maxZoom: 13,
      }),
    );
  });
});
