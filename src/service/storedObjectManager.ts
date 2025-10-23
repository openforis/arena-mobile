import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";

export default class StoredObjectManager {
  _instance: any;
  defaultValues: any;
  storageKey: any;
  constructor(storageKey: any, defaultValues = {}) {
    this._instance = null;
    this.storageKey = storageKey;
    this.defaultValues = defaultValues;
  }

  async fetchObject() {
    if (!this._instance) {
      this._instance = {
        ...this.defaultValues,
        ...(await AsyncStorageUtils.getItem(this.storageKey)),
      };
    }
    return this._instance;
  }

  async saveObject(object: any) {
    await AsyncStorageUtils.setItem(this.storageKey, object);
    this._instance = object;
  }

  async getValue(key: any) {
    const obj = await this.fetchObject();
    return obj?.[key];
  }

  async updateValue(key: any, value: any) {
    const objectPrev = await this.fetchObject();
    const objectNext = { ...objectPrev, [key]: value };
    await this.saveObject(objectNext);
    return objectNext;
  }

  async deleteValue(key: any) {
    const objPrev = await this.fetchObject();
    const objNext = { ...objPrev };
    delete objNext[key];
    await this.saveObject(objNext);
    return objNext;
  }
}
