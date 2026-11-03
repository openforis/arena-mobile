import AsyncStorage from "@react-native-async-storage/async-storage";

import { log } from "utils/Logger";

const getItem = async (key: any) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : JSON.parse(value);
  } catch (e) {
    log.warn(`error reading item '${key}' from AsyncStorage: ${e}`);
  }
};

// errors are logged, not thrown: callers (settings, preferences) also run during app start
const setItem = async (key: any, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    log.warn(`error writing item '${key}' to AsyncStorage: ${e}`);
  }
};

const removeItem = async (key: any) => {
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
