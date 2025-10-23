import * as SecureStore from "expo-secure-store";

const keys = {
  connectSIDCookie: "connectSIDCookie",
};

const getItem = async (key: any) => SecureStore.getItemAsync(key);
const setItem = async (key: any, value: any) => SecureStore.setItemAsync(key, value);

const getConnectSIDCookie = async () => getItem(keys.connectSIDCookie);
const setConnectSIDCookie = async (value: any) => setItem(keys.connectSIDCookie, value);

export const SecureStoreService = {
  getConnectSIDCookie,
  setConnectSIDCookie,
};
