import { PromiseUtils } from "utils/PromiseUtils";

import { AsyncStorageUtils } from "./AsyncStorageUtils";
import type { AsyncStorageKey } from "./asyncStorageKeys";

// A JSON value persisted in AsyncStorage under a single key, cached in memory after the first read.
// Writes run one at a time, so read-modify-write updates (see update) don't drop each other.
export class StoredItem<T> {
  private cached: T | undefined;
  private readonly enqueue = PromiseUtils.createSerialQueue();

  constructor(
    private readonly key: AsyncStorageKey,
    protected readonly defaultValue: T,
  ) {}

  protected fromStored(stored: T | null): T {
    return stored ?? this.defaultValue;
  }

  async fetch(): Promise<T> {
    this.cached ??= this.fromStored(
      await AsyncStorageUtils.getItem<T>(this.key),
    );
    return this.cached;
  }

  private async write(value: T): Promise<T> {
    await AsyncStorageUtils.setItem(this.key, value);
    this.cached = value;
    return value;
  }

  save(value: T): Promise<T> {
    return this.enqueue(() => this.write(value));
  }

  update(updateFn: (prev: T) => T): Promise<T> {
    return this.enqueue(async () => this.write(updateFn(await this.fetch())));
  }

  clear(): Promise<void> {
    return this.enqueue(async () => {
      await AsyncStorageUtils.removeItem(this.key);
      this.cached = undefined;
    });
  }
}

// A stored object whose missing properties get the default values.
export class StoredObject<T extends object> extends StoredItem<T> {
  protected override fromStored(stored: T | null): T {
    return { ...this.defaultValue, ...stored };
  }

  async getValue<K extends keyof T>(key: K): Promise<T[K]> {
    return (await this.fetch())[key];
  }

  updateValue<K extends keyof T>(key: K, value: T[K]): Promise<T> {
    return this.update((prev) => ({ ...prev, [key]: value }));
  }

  deleteValue(key: keyof T): Promise<T> {
    return this.update((prev) => {
      const next: Partial<T> = { ...prev };
      delete next[key];
      return next as T;
    });
  }
}
