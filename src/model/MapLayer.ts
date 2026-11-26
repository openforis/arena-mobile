export enum MapProvider {
  // Google Maps on Android, Apple Maps on iOS (react-native-maps default provider)
  default = "default",
  // free raster tile layers rendered as UrlTile on top of an empty base map;
  // tiles are cached on the device and can be pre-fetched for offline use
  freeLayers = "freeLayers",
}

export enum MapLayerType {
  satellite = "satellite",
  topographic = "topographic",
  standard = "standard",
  custom = "custom",
}

// ids of the built-in layers
export enum MapLayerId {
  esriWorldImagery = "esriWorldImagery",
  openTopoMap = "openTopoMap",
  openStreetMap = "openStreetMap",
}

export type MapLayer = {
  // MapLayerId for built-in layers, generated id for custom layers
  id: MapLayerId | string;
  // defined only for custom layers (built-in layers have a translated label)
  name?: string;
  type: MapLayerType;
  // XYZ url template; supports {x}, {y}, {z} placeholders
  urlTemplate: string;
  minZoom: number;
  maxZoom: number;
  attribution: string;
  // false when the provider usage policy forbids bulk downloads (e.g. OpenStreetMap)
  prefetchAllowed: boolean;
  // average size of a tile, used to estimate the space occupied by an area
  averageTileSizeBytes: number;
};

// layer defined by the user in the settings; the (optional) API key is stored separately
export type CustomMapLayer = {
  id: string;
  name: string;
  // XYZ url template; supports {x}, {y}, {z} and {apiKey} placeholders
  urlTemplate: string;
  maxZoom: number;
  attribution?: string;
};
