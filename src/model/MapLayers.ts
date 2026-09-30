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
}

export enum MapLayerId {
  esriWorldImagery = "esriWorldImagery",
  openTopoMap = "openTopoMap",
  openStreetMap = "openStreetMap",
}

export type MapLayer = {
  id: MapLayerId;
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

const layers: MapLayer[] = [
  {
    id: MapLayerId.esriWorldImagery,
    type: MapLayerType.satellite,
    urlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    minZoom: 0,
    maxZoom: 19,
    attribution:
      "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    prefetchAllowed: true,
    averageTileSizeBytes: 22 * 1024,
  },
  {
    id: MapLayerId.openTopoMap,
    type: MapLayerType.topographic,
    urlTemplate: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 17,
    attribution:
      "© OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
    prefetchAllowed: true,
    averageTileSizeBytes: 28 * 1024,
  },
  {
    id: MapLayerId.openStreetMap,
    type: MapLayerType.standard,
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
    prefetchAllowed: false,
    averageTileSizeBytes: 15 * 1024,
  },
];

const layersById = layers.reduce(
  (acc, layer) => {
    acc[layer.id] = layer;
    return acc;
  },
  {} as Record<MapLayerId, MapLayer>,
);

const defaultLayerId = MapLayerId.esriWorldImagery;

const getLayer = (layerId: MapLayerId | string | null | undefined): MapLayer =>
  layersById[layerId as MapLayerId] ?? layersById[defaultLayerId];

const prefetchableLayers = layers.filter((layer) => layer.prefetchAllowed);

export const MapLayers = {
  defaultLayerId,
  layers,
  prefetchableLayers,
  getLayer,
};
