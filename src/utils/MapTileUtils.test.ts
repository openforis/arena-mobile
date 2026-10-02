import { MapTileUtils } from "./MapTileUtils";

const square = (south: number, west: number, north: number, east: number) => [
  { latitude: south, longitude: west },
  { latitude: north, longitude: west },
  { latitude: north, longitude: east },
  { latitude: south, longitude: east },
];

describe("MapTileUtils", () => {
  test("tile coordinates of known points", () => {
    expect(MapTileUtils.lonToTileX(0, 0)).toBe(0);
    expect(MapTileUtils.latToTileY(0, 0)).toBe(0);
    expect(MapTileUtils.lonToTileX(0, 1)).toBe(1);
    expect(MapTileUtils.latToTileY(0, 1)).toBe(1);
    expect(MapTileUtils.lonToTileX(-180, 3)).toBe(0);
    expect(MapTileUtils.lonToTileX(180, 3)).toBe(7);
    // Rome
    expect(MapTileUtils.lonToTileX(12.4964, 10)).toBe(547);
    expect(MapTileUtils.latToTileY(41.9028, 10)).toBe(380);
  });

  test("tile bounds contain the originating point", () => {
    const lat = 41.9028;
    const lon = 12.4964;
    const z = 15;
    const x = MapTileUtils.lonToTileX(lon, z);
    const y = MapTileUtils.latToTileY(lat, z);
    const bounds = MapTileUtils.tileToBounds({ x, y, z });
    expect(bounds.west).toBeLessThanOrEqual(lon);
    expect(bounds.east).toBeGreaterThan(lon);
    expect(bounds.south).toBeLessThanOrEqual(lat);
    expect(bounds.north).toBeGreaterThan(lat);
  });

  test("small area covers a single tile at low zoom levels", () => {
    const coordinates = square(41.9, 12.49, 41.901, 12.491);
    expect(
      MapTileUtils.countTilesForPolygon({
        coordinates,
        minZoom: 0,
        maxZoom: 5,
      }),
    ).toBe(6);
  });

  test("count and list of tiles are consistent", () => {
    const coordinates = square(41.8, 12.4, 42.0, 12.6);
    const params = { coordinates, minZoom: 8, maxZoom: 14 };
    const count = MapTileUtils.countTilesForPolygon(params);
    const tiles = MapTileUtils.computeTilesForPolygon(params);
    expect(tiles).toHaveLength(count);
    const keys = new Set(tiles.map(MapTileUtils.getTileKey));
    expect(keys.size).toBe(count);
  });

  test("triangle covers fewer tiles than its bounding box", () => {
    const params = { minZoom: 14, maxZoom: 14 };
    const box = square(41.8, 12.4, 42.0, 12.6);
    const triangle = [
      { latitude: 41.8, longitude: 12.4 },
      { latitude: 42.0, longitude: 12.4 },
      { latitude: 41.8, longitude: 12.6 },
    ];
    const boxCount = MapTileUtils.countTilesForPolygon({
      ...params,
      coordinates: box,
    });
    const triangleCount = MapTileUtils.countTilesForPolygon({
      ...params,
      coordinates: triangle,
    });
    expect(triangleCount).toBeLessThan(boxCount * 0.7);
    expect(triangleCount).toBeGreaterThan(boxCount * 0.4);
  });

  test("format tile url", () => {
    expect(
      MapTileUtils.formatTileUrl("https://t/{z}/{y}/{x}", { x: 1, y: 2, z: 3 }),
    ).toBe("https://t/3/2/1");
    expect(MapTileUtils.getTileRelativePath({ x: 1, y: 2, z: 3 })).toBe(
      "3/1/2",
    );
  });
});
