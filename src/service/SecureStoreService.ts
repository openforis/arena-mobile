import * as SecureStore from "expo-secure-store";

const keys = {
  authRefreshToken: "authRefreshToken",
};

const getItem = async (key: any) => SecureStore.getItemAsync(key);
const setItem = async (key: any, value: any) =>
  SecureStore.setItemAsync(key, value);

const getAuthRefreshToken = async () => getItem(keys.authRefreshToken);
const setAuthRefreshToken = async (value: any) =>
  setItem(keys.authRefreshToken, value);

export const SecureStoreService = {
  getAuthRefreshToken,
  setAuthRefreshToken,
};
