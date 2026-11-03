import { PromiseUtils } from "utils/PromiseUtils";

import { AsyncStorageUtils } from "./asyncStorage/AsyncStorageUtils";

export default class StoredObjectManager {
  _instance: any = null;
  defaultValues: any;
  storageKey: any;
  // read-modify-write updates run one at a time, otherwise the last write would drop the others
  private enqueueUpdate = PromiseUtils.createSerialQueue();
  constructor(storageKey: any, defaultValues = {}) {
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

  updateValue(key: any, value: any) {
    return this.enqueueUpdate(async () => {
      const objectPrev = await this.fetchObject();
      const objectNext = { ...objectPrev, [key]: value };
      await this.saveObject(objectNext);
      return objectNext;
    });
  }

  deleteValue(key: any) {
    return this.enqueueUpdate(async () => {
      const objPrev = await this.fetchObject();
      const objNext = { ...objPrev };
      delete objNext[key];
      await this.saveObject(objNext);
      return objNext;
    });
  }
}
