import type { OfflineMapArea } from "model/OfflineMapArea";

import type { AsyncStorageKey } from "./asyncStorageKeys";
import { StoredItem, StoredObject } from "./StoredItem";
import { OfflineMapAreaRepository } from "../offlineMaps/offlineMapAreaRepository";

const mockStorage: Record<string, string> = {};

// async gaps between read and write expose lost updates
jest.mock("./AsyncStorageUtils", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 1));
  return {
    AsyncStorageUtils: {
      getItem: async (key: string) => {
        await tick();
        return mockStorage[key] ? JSON.parse(mockStorage[key]) : null;
      },
      setItem: async (key: string, value: unknown) => {
        await tick();
        if ((value as { fail?: boolean } | null)?.fail) {
          throw new Error("write failed");
        }
        mockStorage[key] = JSON.stringify(value);
      },
      removeItem: async (key: string) => {
        delete mockStorage[key];
      },
    },
  };
});

const storedValue = (key: string) => JSON.parse(mockStorage[key]!);

// keys used only in these tests
const testKey = (key: string) => key as AsyncStorageKey;

describe("StoredItem", () => {
  it("returns the default value when nothing is stored", async () => {
    const item = new StoredItem<string[]>(testKey("@empty"), []);
    expect(await item.fetch()).toEqual([]);
  });

  it("persists concurrent updates", async () => {
    const item = new StoredItem<number[]>(testKey("@list"), []);
    await Promise.all([1, 2, 3].map((n) => item.update((l) => [...l, n])));
    expect(storedValue("@list")).toEqual([1, 2, 3]);
  });

  it("clears the stored value and the cache", async () => {
    const item = new StoredItem<number[]>(testKey("@cleared"), []);
    await item.save([1]);
    await item.clear();
    expect(mockStorage["@cleared"]).toBeUndefined();
    expect(await item.fetch()).toEqual([]);
  });
});

describe("StoredObject", () => {
  it("fills missing properties with the default values", async () => {
    mockStorage["@defaults"] = JSON.stringify({ a: 10 });
    const obj = new StoredObject<{ a: number; b: number }>(
      testKey("@defaults"),
      {
        a: 1,
        b: 2,
      },
    );
    expect(await obj.fetch()).toEqual({ a: 10, b: 2 });
  });

  it("persists concurrent updates", async () => {
    const obj = new StoredObject<Record<string, unknown>>(testKey("prefs"), {});
    await Promise.all([
      obj.updateValue("a", 1),
      obj.updateValue("b", 2),
      obj.deleteValue("c"),
    ]);
    expect(storedValue("prefs")).toEqual({ a: 1, b: 2 });
  });

  it("keeps processing updates after a failed one", async () => {
    const obj = new StoredObject<Record<string, unknown>>(
      testKey("prefs2"),
      {},
    );
    const failing = obj.updateValue("fail", true);
    const next = obj.updateValue("ok", true);
    await expect(failing).rejects.toThrow("write failed");
    await next;
    expect(storedValue("prefs2")).toEqual({ ok: true });
  });
});

describe("OfflineMapAreaRepository", () => {
  it("persists concurrent saves and updates", async () => {
    await Promise.all([
      OfflineMapAreaRepository.saveArea({ id: "1" } as OfflineMapArea),
      OfflineMapAreaRepository.saveArea({ id: "2" } as OfflineMapArea),
      OfflineMapAreaRepository.updateAreas((areas) =>
        areas.map((area) => ({ ...area, sizeBytes: 0 })),
      ),
    ]);
    const areas = await OfflineMapAreaRepository.fetchAreas();
    expect(areas).toEqual([
      { id: "1", sizeBytes: 0 },
      { id: "2", sizeBytes: 0 },
    ]);
  });
});
