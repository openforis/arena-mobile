import StoredObjectManager from "./storedObjectManager";
import { OfflineMapAreaRepository } from "./offlineMaps/offlineMapAreaRepository";

const mockStorage: Record<string, any> = {};

// async gaps between read and write expose lost updates
jest.mock("./asyncStorage/AsyncStorageUtils", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 1));
  return {
    AsyncStorageUtils: {
      getItem: async (key: string) => {
        await tick();
        return mockStorage[key] ? JSON.parse(mockStorage[key]) : null;
      },
      setItem: async (key: string, value: any) => {
        await tick();
        if (value?.fail) throw new Error("write failed");
        mockStorage[key] = JSON.stringify(value);
      },
      removeItem: async (key: string) => {
        delete mockStorage[key];
      },
    },
  };
});

describe("StoredObjectManager", () => {
  it("persists concurrent updates", async () => {
    const manager = new StoredObjectManager("prefs");
    await Promise.all([
      manager.updateValue("a", 1),
      manager.updateValue("b", 2),
      manager.deleteValue("c"),
    ]);
    expect(JSON.parse(mockStorage["prefs"])).toEqual({ a: 1, b: 2 });
  });

  it("keeps processing updates after a failed one", async () => {
    const manager = new StoredObjectManager("prefs2");
    const failing = manager.updateValue("fail", true);
    const next = manager.updateValue("ok", true);
    await expect(failing).rejects.toThrow("write failed");
    await next;
    expect(JSON.parse(mockStorage["prefs2"])).toEqual({ ok: true });
  });
});

describe("OfflineMapAreaRepository", () => {
  it("persists concurrent saves", async () => {
    await Promise.all([
      OfflineMapAreaRepository.saveArea({ id: "1" } as any),
      OfflineMapAreaRepository.saveArea({ id: "2" } as any),
    ]);
    const areas = await OfflineMapAreaRepository.fetchAreas();
    expect(areas.map((area) => area.id)).toEqual(["1", "2"]);
  });
});
