import * as SecureStore from "expo-secure-store";
import * as Keychain from "react-native-keychain";

import { Objects } from "@openforis/arena-core";

const keys = {
  authRefreshToken: "authRefreshToken",
};

const getItem = (key: string) => SecureStore.getItemAsync(key);
const setItem = (key: string, value: string | null | undefined) =>
  Objects.isEmpty(value)
    ? SecureStore.deleteItemAsync(key)
    : SecureStore.setItemAsync(key, value!);

const getAuthRefreshToken = () => getItem(keys.authRefreshToken);
const setAuthRefreshToken = (value: string | null) =>
  setItem(keys.authRefreshToken, value);

// keys can contain only alphanumeric characters, ".", "-" and "_"
const getMapLayerApiKeyStoreKey = (layerId: string) =>
  `mapLayerApiKey_${layerId}`;
const getMapLayerApiKey = (layerId: string): Promise<string | null> =>
  getItem(getMapLayerApiKeyStoreKey(layerId));
const setMapLayerApiKey = (layerId: string, value: string) =>
  setItem(getMapLayerApiKeyStoreKey(layerId), value);

// login credentials (email and password) by server url, in the device keychain
const getServerCredentials = (serverUrl: string) =>
  Keychain.getInternetCredentials(serverUrl);
const setServerCredentials = (
  serverUrl: string,
  email: string,
  password: string,
) => Keychain.setInternetCredentials(serverUrl, email, password);
const resetServerCredentials = (serverUrl: string) =>
  Keychain.resetInternetCredentials({ server: serverUrl });

export const SecureStoreService = {
  getAuthRefreshToken,
  setAuthRefreshToken,
  getMapLayerApiKey,
  setMapLayerApiKey,
  getServerCredentials,
  setServerCredentials,
  resetServerCredentials,
};
