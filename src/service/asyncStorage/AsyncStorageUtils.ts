import AsyncStorage from "@react-native-async-storage/async-storage";

import { log } from "utils/Logger";

import type { AsyncStorageKey } from "./asyncStorageKeys";

const getItem = async <T>(key: AsyncStorageKey): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as T);
  } catch (e) {
    log.warn(`error reading item '${key}' from AsyncStorage: ${e}`);
    return null;
  }
};

// errors are logged, not thrown: callers (settings, preferences) also run during app start
const setItem = async (key: AsyncStorageKey, value: unknown) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    log.warn(`error writing item '${key}' to AsyncStorage: ${e}`);
  }
};

const removeItem = async (key: AsyncStorageKey) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    log.warn(`error removing item '${key}' from AsyncStorage: ${e}`);
  }
};

export const AsyncStorageUtils = {
  getItem,
  setItem,
  removeItem,
};
