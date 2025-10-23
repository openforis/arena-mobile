import AsyncStorage from "@react-native-async-storage/async-storage";

const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : JSON.parse(value);
  } catch (e) {
    // ignore errors
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore errors
  }
};

const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // ignore errors
  }
};

export const AsyncStorageUtils = {
  getItem,
  setItem,
  removeItem,
};
