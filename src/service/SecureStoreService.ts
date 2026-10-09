import * as SecureStore from "expo-secure-store";

import { Objects } from "@openforis/arena-core";

const keys = {
  authRefreshToken: "authRefreshToken",
};

const getItem = (key: any) => SecureStore.getItemAsync(key);
const setItem = (key: any, value: any) =>
  Objects.isEmpty(value)
    ? SecureStore.deleteItemAsync(key)
    : SecureStore.setItemAsync(key, value);

const getAuthRefreshToken = () => getItem(keys.authRefreshToken);
const setAuthRefreshToken = (value: any) =>
  setItem(keys.authRefreshToken, value);

// keys can contain only alphanumeric characters, ".", "-" and "_"
const getMapLayerApiKeyStoreKey = (layerId: string) =>
  `mapLayerApiKey_${layerId}`;
const getMapLayerApiKey = (layerId: string): Promise<string | null> =>
  getItem(getMapLayerApiKeyStoreKey(layerId));
const setMapLayerApiKey = (layerId: string, value: string) =>
  setItem(getMapLayerApiKeyStoreKey(layerId), value);

export const SecureStoreService = {
  getAuthRefreshToken,
  setAuthRefreshToken,
  getMapLayerApiKey,
  setMapLayerApiKey,
};
