import { GeoPdfParser } from "./GeoPdfParser";
import { buildGeoPdf } from "./geoPdfFixtures.testUtils";

// corners of the map: lower-left, upper-left, upper-right, lower-right (as the default LPTS)
const gpts = [45.0, 7.0, 45.1, 7.0, 45.1, 7.15, 45.0, 7.15];

describe("GeoPdfParser", () => {
  test("reads the georeferencing of a page", async () => {
    const bytes = await buildGeoPdf([
      {
        size: [600, 800],
        viewports: [
          {
            bbox: [50, 100, 550, 700],
            gpts,
            epsg: 32632,
            name: "Main map",
          },
        ],
      },
    ]);
    const info = await GeoPdfParser.parse(bytes);
    expect(info.pagesCount).toBe(1);
    expect(info.hasUnsupportedGeoreference).toBe(false);
    expect(info.pages).toHaveLength(1);
    const page = info.pages[0]!;
    expect(page.pageIndex).toBe(0);
    expect(page.rotate).toBe(0);
    expect(page.box).toEqual({ x1: 0, y1: 0, x2: 600, y2: 800 });
    const viewport = page.viewports[0]!;
    expect(viewport.name).toBe("Main map");
    expect(viewport.bbox).toEqual({ x1: 50, y1: 100, x2: 550, y2: 700 });
    expect(viewport.crs).toEqual({ epsg: 32632 });
    expect(viewport.datumCompatible).toBe(true);
    expect(viewport.verticallyFlipped).toBe(false);
    expect(viewport.controlPoints).toEqual([
      { user: { x: 50, y: 100 }, latLng: { latitude: 45, longitude: 7 } },
      { user: { x: 50, y: 700 }, latLng: { latitude: 45.1, longitude: 7 } },
      { user: { x: 550, y: 700 }, latLng: { latitude: 45.1, longitude: 7.15 } },
      { user: { x: 550, y: 100 }, latLng: { latitude: 45, longitude: 7.15 } },
    ]);
    // default bounds: the whole bbox
    expect(viewport.neatline).toEqual([
      { x: 50, y: 100 },
      { x: 50, y: 700 },
      { x: 550, y: 700 },
      { x: 550, y: 100 },
    ]);
  });

  test("main map viewport first, pages without georeferencing skipped", async () => {
    const bytes = await buildGeoPdf([
      { size: [300, 300] },
      {
        size: [600, 800],
        rotate: 90,
        cropBox: [10, 10, 590, 790],
        viewports: [
          { bbox: [400, 600, 550, 750], gpts },
          {
            bbox: [50, 100, 550, 700],
            gpts,
            bounds: [0.1, 0.1, 0.1, 0.9, 0.9, 0.9, 0.9, 0.1],
          },
        ],
      },
    ]);
    const info = await GeoPdfParser.parse(bytes);
    expect(info.pagesCount).toBe(2);
    expect(info.pages).toHaveLength(1);
    const page = info.pages[0]!;
    expect(page.pageIndex).toBe(1);
    expect(page.rotate).toBe(90);
    expect(page.box).toEqual({ x1: 10, y1: 10, x2: 590, y2: 790 });
    expect(page.viewports).toHaveLength(2);
    expect(page.viewports[0]!.bbox).toEqual({
      x1: 50,
      y1: 100,
      x2: 550,
      y2: 700,
    });
    expect(page.viewports[0]!.neatline[0]!.x).toBeCloseTo(100);
    expect(page.viewports[0]!.neatline[0]!.y).toBeCloseTo(160);
  });

  test("points written with the y axis pointing down are not read as a mirrored map", async () => {
    const bytes = await buildGeoPdf([
      {
        size: [600, 800],
        viewports: [
          {
            bbox: [50, 100, 550, 700],
            gpts,
            // same corners of the default LPTS, with the y axis pointing down
            lpts: [0, 1, 0, 0, 1, 0, 1, 1],
            bounds: [0, 0.1, 0, 1, 1, 1, 1, 0.1],
          },
        ],
      },
    ]);
    const info = await GeoPdfParser.parse(bytes);
    const viewport = info.pages[0]!.viewports[0]!;
    expect(viewport.verticallyFlipped).toBe(true);
    expect(viewport.controlPoints).toEqual([
      { user: { x: 50, y: 100 }, latLng: { latitude: 45, longitude: 7 } },
      { user: { x: 50, y: 700 }, latLng: { latitude: 45.1, longitude: 7 } },
      { user: { x: 550, y: 700 }, latLng: { latitude: 45.1, longitude: 7.15 } },
      { user: { x: 550, y: 100 }, latLng: { latitude: 45, longitude: 7.15 } },
    ]);
    // the bounds are flipped too: 10% of the bbox height excluded at the bottom
    expect(viewport.neatline[0]!.y).toBeCloseTo(640);
    expect(viewport.neatline[1]!.y).toBeCloseTo(100);
  });

  test("bbox written top first (ArcGIS): points relative to the first corner", async () => {
    const bytes = await buildGeoPdf([
      {
        size: [600, 800],
        viewports: [
          {
            bbox: [50, 700, 550, 100],
            gpts,
            lpts: [0, 1, 0, 0, 1, 0, 1, 1],
          },
        ],
      },
    ]);
    const info = await GeoPdfParser.parse(bytes);
    const viewport = info.pages[0]!.viewports[0]!;
    expect(viewport.bbox).toEqual({ x1: 50, y1: 100, x2: 550, y2: 700 });
    expect(viewport.verticallyFlipped).toBe(false);
    expect(viewport.controlPoints).toEqual([
      { user: { x: 50, y: 100 }, latLng: { latitude: 45, longitude: 7 } },
      { user: { x: 50, y: 700 }, latLng: { latitude: 45.1, longitude: 7 } },
      { user: { x: 550, y: 700 }, latLng: { latitude: 45.1, longitude: 7.15 } },
      { user: { x: 550, y: 100 }, latLng: { latitude: 45, longitude: 7.15 } },
    ]);
  });

  test("swapped latitude/longitude are detected", async () => {
    const bytes = await buildGeoPdf([
      {
        size: [600, 800],
        viewports: [
          {
            bbox: [0, 0, 600, 800],
            gpts: [-0.2, 120.1, 0.0, 120.1, 0.0, 120.3, -0.2, 120.3],
          },
        ],
      },
    ]);
    const info = await GeoPdfParser.parse(bytes);
    expect(info.pages[0]!.viewports[0]!.controlPoints[0]!.latLng).toEqual({
      latitude: -0.2,
      longitude: 120.1,
    });
  });

  test("not georeferenced PDF", async () => {
    const bytes = await buildGeoPdf([{ size: [600, 800] }]);
    const info = await GeoPdfParser.parse(bytes);
    expect(info.pages).toHaveLength(0);
    expect(info.hasUnsupportedGeoreference).toBe(false);
  });

  test("OGC GeoPDF encoding is reported as unsupported", async () => {
    const bytes = await buildGeoPdf([{ size: [600, 800], lgiDict: true }]);
    const info = await GeoPdfParser.parse(bytes);
    expect(info.pages).toHaveLength(0);
    expect(info.hasUnsupportedGeoreference).toBe(true);
  });

  test("datum compatibility", () => {
    expect(GeoPdfParser.isDatumCompatible(undefined)).toBe(true);
    expect(GeoPdfParser.isDatumCompatible({ epsg: 4326 })).toBe(true);
    expect(GeoPdfParser.isDatumCompatible({ epsg: 32633 })).toBe(true);
    expect(GeoPdfParser.isDatumCompatible({ epsg: 25832 })).toBe(true);
    // ED50 / UTM 32N
    expect(GeoPdfParser.isDatumCompatible({ epsg: 23032 })).toBe(false);
    expect(
      GeoPdfParser.isDatumCompatible({
        wkt: 'PROJCS["WGS 84 / UTM zone 32N",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]]]]',
      }),
    ).toBe(true);
    expect(
      GeoPdfParser.isDatumCompatible({
        wkt: 'PROJCS["NAD_1983_California_Teale_Albers",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]]]]',
      }),
    ).toBe(true);
    expect(
      GeoPdfParser.isDatumCompatible({
        wkt: 'GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.978698213898]]]',
      }),
    ).toBe(false);
  });
});
