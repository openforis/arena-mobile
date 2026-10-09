import { UUIDs } from "@openforis/arena-core";

import { CustomMapLayer, MapLayers } from "model/MapLayers";
import { SettingsObject } from "model/SettingsModel";
import { Files } from "utils/Files";
import { log } from "utils/Logger";
import { MapTileUtils } from "utils/MapTileUtils";

import { mapTilesUserAgent } from "../offlineMaps/mapTilesUserAgent";
import { OfflineMapTilesStorage } from "../offlineMaps/offlineMapTilesStorage";
import { SecureStoreService } from "../SecureStoreService";
import { SettingsService } from "../settingsService";
import {
  CustomMapLayerValidation,
  CustomMapLayerValidator,
} from "./customMapLayerValidator";

const TEST_TIMEOUT_MILLIS = 15000;
const TEST_TILE = { x: 0, y: 0, z: 0 };

export type CustomMapLayerTestResult = {
  success: boolean;
  // HTTP status (missing when the server cannot be reached)
  status?: number;
};

// API keys are kept in memory, to make them available synchronously
const apiKeysByLayerId = new Map<string, string>();

const updateLayersRegistry = (customLayers: CustomMapLayer[]): void => {
  MapLayers.setCustomLayers(
    customLayers.map((customLayer) =>
      MapLayers.customLayerToLayer(
        customLayer,
        apiKeysByLayerId.get(customLayer.id),
      ),
    ),
  );
};

const fetchApiKey = async (layerId: string): Promise<string | null> => {
  try {
    return await SecureStoreService.getMapLayerApiKey(layerId);
  } catch (error) {
    log.error(`error fetching API key of map layer ${layerId}`, error);
    return null;
  }
};

// loads the API keys of the custom layers and makes the layers available to the maps
const init = async (settings: SettingsObject): Promise<void> => {
  const customLayers = settings.customMapLayers ?? [];
  apiKeysByLayerId.clear();
  for (const { id } of customLayers) {
    const apiKey = await fetchApiKey(id);
    if (apiKey) apiKeysByLayerId.set(id, apiKey);
  }
  updateLayersRegistry(customLayers);
};

const newLayer = (): CustomMapLayer => ({
  id: `${MapLayers.CUSTOM_LAYER_ID_PREFIX}${UUIDs.v4()}`,
  name: "",
  urlTemplate: "",
  maxZoom: MapLayers.CUSTOM_LAYER_DEFAULT_MAX_ZOOM,
});

const getApiKey = (layerId: string): string =>
  apiKeysByLayerId.get(layerId) ?? "";

const validateLayer = ({
  layer,
  apiKey,
  layers,
}: {
  layer: CustomMapLayer;
  apiKey: string;
  layers: CustomMapLayer[];
}): CustomMapLayerValidation =>
  CustomMapLayerValidator.validate({ layer, apiKey, layers });

const deleteLayerTiles = (layerId: string): Promise<void> =>
  Files.del(OfflineMapTilesStorage.getLayerTilesDirUri(layerId), true);

const storeApiKey = async (layerId: string, apiKey: string): Promise<void> => {
  await SecureStoreService.setMapLayerApiKey(layerId, apiKey);
  if (apiKey) {
    apiKeysByLayerId.set(layerId, apiKey);
  } else {
    apiKeysByLayerId.delete(layerId);
  }
};

// inserts or updates the layer; resolves with the updated settings
const saveLayer = async ({
  layer,
  apiKey,
}: {
  layer: CustomMapLayer;
  apiKey: string;
}): Promise<SettingsObject> => {
  const settings = await SettingsService.fetchSettings();
  const layers = settings.customMapLayers ?? [];
  const layerPrev = layers.find((item) => item.id === layer.id);

  const attribution = layer.attribution?.trim();
  const layerNext: CustomMapLayer = {
    id: layer.id,
    name: layer.name.trim(),
    urlTemplate: layer.urlTemplate.trim(),
    maxZoom: layer.maxZoom,
    ...(attribution ? { attribution } : {}),
  };
  const apiKeyNext = apiKey.trim();

  if (
    layerPrev &&
    (layerPrev.urlTemplate !== layerNext.urlTemplate ||
      getApiKey(layer.id) !== apiKeyNext)
  ) {
    // tiles cached with the previous url could belong to a different map
    await deleteLayerTiles(layer.id);
  }
  await storeApiKey(layer.id, apiKeyNext);

  const layersNext = layerPrev
    ? layers.map((item) => (item.id === layer.id ? layerNext : item))
    : [...layers, layerNext];
  const settingsNext = { ...settings, customMapLayers: layersNext };
  await SettingsService.saveSettings(settingsNext);
  updateLayersRegistry(layersNext);
  return settingsNext;
};

// deletes the layer, its API key and its cached tiles; resolves with the updated settings
const deleteLayer = async (layerId: string): Promise<SettingsObject> => {
  const settings = await SettingsService.fetchSettings();
  const layersNext = (settings.customMapLayers ?? []).filter(
    (item) => item.id !== layerId,
  );
  const settingsNext: SettingsObject = {
    ...settings,
    customMapLayers: layersNext,
    mapLayer:
      settings.mapLayer === layerId
        ? MapLayers.defaultLayerId
        : settings.mapLayer,
  };
  await SettingsService.saveSettings(settingsNext);
  updateLayersRegistry(layersNext);
  await storeApiKey(layerId, "");
  await deleteLayerTiles(layerId);
  return settingsNext;
};

// tries to download a tile, to check that url template and API key are correct
const testLayer = async ({
  urlTemplate,
  apiKey,
}: {
  urlTemplate: string;
  apiKey: string;
}): Promise<CustomMapLayerTestResult> => {
  const url = MapTileUtils.formatTileUrl(
    MapLayers.applyApiKey(urlTemplate.trim(), apiKey),
    TEST_TILE,
  );
  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    TEST_TIMEOUT_MILLIS,
  );
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": mapTilesUserAgent },
      signal: abortController.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    return {
      success: response.ok && contentType.startsWith("image/"),
      status: response.status,
    };
  } catch (error) {
    // the url can contain the API key: do not log it
    log.debug(`custom map layer test failed: ${String(error)}`);
    return { success: false };
  } finally {
    clearTimeout(timeout);
  }
};

export const CustomMapLayersService = {
  init,
  newLayer,
  getApiKey,
  validateLayer,
  isValid: CustomMapLayerValidator.isValid,
  saveLayer,
  deleteLayer,
  testLayer,
};
