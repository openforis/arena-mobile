import { LatLng } from "model/LocationPoint";

// Web Mercator (XYZ / "slippy map") tile utilities

export type TileCoordinate = { x: number; y: number; z: number };

type TileRowCoverage = { y: number; xMin: number; xMax: number };

const MAX_LATITUDE = 85.05112878;

const clampLatitude = (lat: number): number =>
  Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));

const tilesPerSide = (zoom: number): number => 2 ** zoom;

const clampTileIndex = (index: number, zoom: number): number =>
  Math.max(0, Math.min(tilesPerSide(zoom) - 1, index));

const lonToTileX = (lon: number, zoom: number): number =>
  clampTileIndex(Math.floor(((lon + 180) / 360) * tilesPerSide(zoom)), zoom);

const latToTileY = (lat: number, zoom: number): number => {
  const latRad = (clampLatitude(lat) * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    tilesPerSide(zoom);
  return clampTileIndex(Math.floor(y), zoom);
};

const tileXToLon = (x: number, zoom: number): number =>
  (x / tilesPerSide(zoom)) * 360 - 180;

const tileYToLat = (y: number, zoom: number): number => {
  const n = Math.PI - (2 * Math.PI * y) / tilesPerSide(zoom);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

const tileToBounds = ({ x, y, z }: TileCoordinate) => ({
  north: tileYToLat(y, z),
  south: tileYToLat(y + 1, z),
  west: tileXToLon(x, z),
  east: tileXToLon(x + 1, z),
});

// Returns the longitudes of the portion of the segment a-b that falls within the latitude band [south, north]
const clipSegmentLongitudesToLatitudeBand = ({
  a,
  b,
  south,
  north,
}: {
  a: LatLng;
  b: LatLng;
  south: number;
  north: number;
}): number[] => {
  const minLat = Math.min(a.latitude, b.latitude);
  const maxLat = Math.max(a.latitude, b.latitude);
  if (maxLat < south || minLat > north) return [];

  if (a.latitude === b.latitude) {
    return [a.longitude, b.longitude];
  }
  const lonAtLat = (lat: number): number =>
    a.longitude +
    ((lat - a.latitude) / (b.latitude - a.latitude)) *
      (b.longitude - a.longitude);

  const fromLat = Math.max(minLat, south);
  const toLat = Math.min(maxLat, north);
  return [lonAtLat(fromLat), lonAtLat(toLat)];
};

// For each tile row, computes the range of tile columns covered by the polygon.
// Concave parts within the same row are filled (the result can slightly over-estimate the covered tiles,
// never under-estimate them).
const computePolygonRowsCoverage = ({
  coordinates,
  zoom,
}: {
  coordinates: LatLng[];
  zoom: number;
}): TileRowCoverage[] => {
  if (coordinates.length === 0) return [];

  const latitudes = coordinates.map((c) => c.latitude);
  const yMin = latToTileY(Math.max(...latitudes), zoom);
  const yMax = latToTileY(Math.min(...latitudes), zoom);

  const rows: TileRowCoverage[] = [];
  for (let y = yMin; y <= yMax; y += 1) {
    const north = tileYToLat(y, zoom);
    const south = tileYToLat(y + 1, zoom);
    const longitudes: number[] = [];
    for (let index = 0; index < coordinates.length; index += 1) {
      const a = coordinates[index]!;
      const b = coordinates[(index + 1) % coordinates.length]!;
      longitudes.push(
        ...clipSegmentLongitudesToLatitudeBand({ a, b, south, north }),
      );
    }
    if (longitudes.length === 0) continue;

    rows.push({
      y,
      xMin: lonToTileX(Math.min(...longitudes), zoom),
      xMax: lonToTileX(Math.max(...longitudes), zoom),
    });
  }
  return rows;
};

const countTilesForPolygon = ({
  coordinates,
  minZoom,
  maxZoom,
}: {
  coordinates: LatLng[];
  minZoom: number;
  maxZoom: number;
}): number => {
  let count = 0;
  for (let zoom = minZoom; zoom <= maxZoom; zoom += 1) {
    const rows = computePolygonRowsCoverage({ coordinates, zoom });
    for (const { xMin, xMax } of rows) {
      count += xMax - xMin + 1;
    }
  }
  return count;
};

const computeTilesForPolygon = ({
  coordinates,
  minZoom,
  maxZoom,
}: {
  coordinates: LatLng[];
  minZoom: number;
  maxZoom: number;
}): TileCoordinate[] => {
  const tiles: TileCoordinate[] = [];
  for (let z = minZoom; z <= maxZoom; z += 1) {
    const rows = computePolygonRowsCoverage({ coordinates, zoom: z });
    for (const { y, xMin, xMax } of rows) {
      for (let x = xMin; x <= xMax; x += 1) {
        tiles.push({ x, y, z });
      }
    }
  }
  return tiles;
};

const formatTileUrl = (
  urlTemplate: string,
  { x, y, z }: TileCoordinate,
): string =>
  urlTemplate
    .replaceAll("{x}", String(x))
    .replaceAll("{y}", String(y))
    .replaceAll("{z}", String(z));

// same layout used by react-native-maps UrlTile tile cache: {tileCachePath}/{z}/{x}/{y}
const getTileRelativePath = ({ x, y, z }: TileCoordinate): string =>
  `${z}/${x}/${y}`;

const getTileKey = getTileRelativePath;

export const MapTileUtils = {
  lonToTileX,
  latToTileY,
  tileXToLon,
  tileYToLat,
  tileToBounds,
  countTilesForPolygon,
  computeTilesForPolygon,
  formatTileUrl,
  getTileRelativePath,
  getTileKey,
};
