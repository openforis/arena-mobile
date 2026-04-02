import { Region } from "react-native-maps";

import { LatLng } from "model";

const defaultCoordinateEpsilon = 0.000001;

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
  extractPolygonCoordinatesFromGeoJson,
  hasCoordinate,
  isSameCoordinate,
  defaultMapRegion,
};
