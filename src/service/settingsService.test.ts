import { SettingsService } from "./settingsService";

const mockStorage: Record<string, string> = {};

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
        mockStorage[key] = JSON.stringify(value);
      },
    },
  };
});
jest.mock("./api", () => ({ API: {} }));
jest.mock("utils/SystemUtils", () => ({ SystemUtils: {} }));

describe("SettingsService.updateSetting", () => {
  it("persists overlapping updates", async () => {
    await Promise.all([
      SettingsService.updateSetting({ key: "fontScale", value: 2 } as any),
      SettingsService.updateSetting({
        key: "animationsEnabled",
        value: false,
      } as any),
    ]);
    const stored = JSON.parse(Object.values(mockStorage)[0]!);
    expect(stored.fontScale).toBe(2);
    expect(stored.animationsEnabled).toBe(false);
  });
});

describe("SettingsService.updateSettings", () => {
  it("doesn't drop updates made while other updates are pending", async () => {
    await Promise.all([
      SettingsService.updateSetting({ key: "fontScale", value: 3 } as any),
      SettingsService.updateSettings((settings) => ({
        ...settings,
        pdfMaps: [{ id: "map" } as any],
      })),
    ]);
    const stored = JSON.parse(Object.values(mockStorage)[0]!);
    expect(stored.fontScale).toBe(3);
    expect(stored.pdfMaps).toEqual([{ id: "map" }]);
  });
});
