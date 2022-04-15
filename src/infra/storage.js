import {MMKV} from 'react-native-mmkv';

const mmkvstorage = new MMKV();

// Unfortunately redux-persist expects Promises,
// so we have to wrap our sync calls with Promise resolvers/rejecters
export const storage = {
  setItem: (key, value) => {
    mmkvstorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = mmkvstorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: key => {
    mmkvstorage.delete(key);
    return Promise.resolve();
  },
};
