import AsyncStorage from "@react-native-async-storage/async-storage";

const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : JSON.parse(value);
  } catch (e) {
    // error reading value
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // saving error
  }
};

export const AsyncStorageUtils = {
  getItem,
  setItem,
};
