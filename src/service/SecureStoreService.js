import * as SecureStore from "expo-secure-store";

const keys = {
  connectSIDCookie: "connectSIDCookie",
};

const getItem = async (key) => SecureStore.getItemAsync(key);
const setItem = async (key, value) => SecureStore.setItemAsync(key, value);

const getConnectSIDCookie = async () => getItem(keys.connectSIDCookie);
const setConnectSIDCookie = async (value) =>
  setItem(keys.connectSIDCookie, value);

export const SecureStoreService = {
  getConnectSIDCookie,
  setConnectSIDCookie,
};
