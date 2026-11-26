import {
  CustomMapLayer,
  MapLayer,
  MapLayerId,
  MapLayerType,
} from "../MapLayer";

const builtInLayers: MapLayer[] = [
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

const CUSTOM_LAYER_ID_PREFIX = "custom_";
const CUSTOM_LAYER_DEFAULT_MAX_ZOOM = 19;
const CUSTOM_LAYER_AVERAGE_TILE_SIZE_BYTES = 20 * 1024;
const API_KEY_PLACEHOLDER = "{apiKey}";

const defaultLayerId = MapLayerId.esriWorldImagery;

const defaultLayer = builtInLayers.find(
  (layer) => layer.id === defaultLayerId,
)!;

// custom layers with the API key already applied to the url template (set by CustomMapLayersService)
let customLayers: MapLayer[] = [];

const setCustomLayers = (layers: MapLayer[]): void => {
  customLayers = layers;
};

const getLayers = (): MapLayer[] => [...builtInLayers, ...customLayers];

// falls back to the default layer when the layer id is not specified or not valid
const getLayer = (layerId: string | null | undefined): MapLayer =>
  getLayers().find((layer) => layer.id === layerId) ?? defaultLayer;

const getLayerLabel = (layer: MapLayer, t: (key: string) => string): string =>
  layer.name ?? t(`offlineMaps:layers.${layer.id}`);

const getPrefetchableLayers = (): MapLayer[] =>
  getLayers().filter((layer) => layer.prefetchAllowed);

const isCustomLayer = (layer: MapLayer): boolean =>
  layer.type === MapLayerType.custom;

const applyApiKey = (urlTemplate: string, apiKey?: string | null): string =>
  urlTemplate.replaceAll(
    API_KEY_PLACEHOLDER,
    encodeURIComponent(apiKey?.trim() ?? ""),
  );

const customLayerToLayer = (
  customLayer: CustomMapLayer,
  apiKey?: string | null,
): MapLayer => ({
  id: customLayer.id,
  name: customLayer.name,
  type: MapLayerType.custom,
  urlTemplate: applyApiKey(customLayer.urlTemplate, apiKey),
  minZoom: 0,
  maxZoom: customLayer.maxZoom,
  attribution: customLayer.attribution ?? "",
  // the user is asked to check the terms of use of the provider before downloading
  prefetchAllowed: true,
  averageTileSizeBytes: CUSTOM_LAYER_AVERAGE_TILE_SIZE_BYTES,
});

export const MapLayers = {
  API_KEY_PLACEHOLDER,
  CUSTOM_LAYER_ID_PREFIX,
  CUSTOM_LAYER_DEFAULT_MAX_ZOOM,
  defaultLayerId,
  getPrefetchableLayers,
  isCustomLayer,
  getLayers,
  getLayer,
  getLayerLabel,
  setCustomLayers,
  applyApiKey,
  customLayerToLayer,
};
