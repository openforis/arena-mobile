import { Region } from "react-native-maps";

import { LatLng } from "model";

const defaultCoordinateEpsilon = 0.000001;

const EARTH_RADIUS_METERS = 6378137;
const SQUARE_METERS_PER_HECTARE = 10000;
const SQUARE_METERS_PER_SQUARE_KM = 1000000;
// areas bigger than 1000 ha are formatted in km²
const MIN_SQUARE_METERS_IN_SQUARE_KM = 1000 * SQUARE_METERS_PER_HECTARE;

const defaultMapRegion: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 60,
  longitudeDelta: 60,
};

const computeRegionFromCoordinates = (coordinates: LatLng[]): Region => {
  if (coordinates.length === 0) return defaultMapRegion;

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);

  return {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(
      (Math.max(...latitudes) - Math.min(...latitudes)) * 1.5,
      0.01,
    ),
    longitudeDelta: Math.max(
      (Math.max(...longitudes) - Math.min(...longitudes)) * 1.5,
      0.01,
    ),
  };
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

// geodesic area (in square meters) of a polygon on a sphere having the WGS84 equatorial radius;
// the polygon is implicitly closed (the last coordinate is connected to the first one)
const computePolygonArea = (coordinates: LatLng[]): number => {
  const count = coordinates.length;
  if (count < 3) return 0;

  let total = 0;
  for (let i = 0; i < count; i++) {
    const previous = coordinates[(i + count - 1) % count]!;
    const current = coordinates[i]!;
    const next = coordinates[(i + 1) % count]!;
    total +=
      toRadians(next.longitude - previous.longitude) *
      Math.sin(toRadians(current.latitude));
  }
  return Math.abs((total * EARTH_RADIUS_METERS ** 2) / 2);
};

// formats an area using the most readable unit (m², ha or km²)
const formatArea = (squareMeters: number): string => {
  if (squareMeters < SQUARE_METERS_PER_HECTARE) {
    return `${Math.round(squareMeters)} m²`;
  }
  if (squareMeters < MIN_SQUARE_METERS_IN_SQUARE_KM) {
    return `${(squareMeters / SQUARE_METERS_PER_HECTARE).toFixed(2)} ha`;
  }
  return `${(squareMeters / SQUARE_METERS_PER_SQUARE_KM).toFixed(2)} km²`;
};

const computeMidpointCoordinate = (coord1: LatLng, coord2: LatLng): LatLng => {
  return {
    latitude: (coord1.latitude + coord2.latitude) / 2,
    longitude: (coord1.longitude + coord2.longitude) / 2,
  };
};

const isSameCoordinate = (
  coord1: LatLng,
  coord2: LatLng,
  epsilon: number = defaultCoordinateEpsilon,
): boolean =>
  Math.abs(coord1.latitude - coord2.latitude) <= epsilon &&
  Math.abs(coord1.longitude - coord2.longitude) <= epsilon;

const hasCoordinate = (
  coordinates: LatLng[],
  coordinate: LatLng,
  epsilon?: number,
): boolean =>
  coordinates.some((item) => isSameCoordinate(item, coordinate, epsilon));

const extractPolygonCoordinatesFromGeoJson = (
  geoJsonValue: any,
): LatLng[] | null => {
  let coordinates: [number, number][] | undefined =
    geoJsonValue?.geometry?.coordinates?.[0];
  if (!coordinates?.length) return null;

  // Map from [longitude, latitude] tuples to { latitude, longitude } objects
  const mappedCoordinates = coordinates
    .filter(
      (coordinate: unknown): coordinate is [number, number] =>
        Array.isArray(coordinate) && coordinate.length >= 2,
    )
    .map(([longitude, latitude]) => ({ latitude, longitude }));

  if (mappedCoordinates.length < 3) return null;

  // Remove closing coordinate if it matches the first one
  const firstCoordinate = mappedCoordinates[0];
  const lastCoordinate = mappedCoordinates.at(-1);
  if (
    firstCoordinate &&
    lastCoordinate &&
    isSameCoordinate(firstCoordinate, lastCoordinate, 0)
  ) {
    return mappedCoordinates.slice(0, -1);
  }

  return mappedCoordinates;
};

export const GeoUtils = {
  computeRegionFromCoordinates,
  computeMidpointCoordinate,
  computePolygonArea,
  formatArea,
  extractPolygonCoordinatesFromGeoJson,
  hasCoordinate,
  isSameCoordinate,
  defaultMapRegion,
};
