import { LatLng, Region } from "react-native-maps";

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

const computeMidpointCoordinate = (a: LatLng, b: LatLng): LatLng => ({
  latitude: (a.latitude + b.latitude) / 2,
  longitude: (a.longitude + b.longitude) / 2,
});

export const GeoUtils = {
  computeMidpointCoordinate,
  computeRegionFromCoordinates,
  defaultMapRegion,
};
