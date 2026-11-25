import type { ImportedMap } from "model/ImportedMap";

import { SettingsService } from "./settingsService";

const mockStorage: Record<string, string> = {};

// async gaps between read and write expose lost updates
jest.mock("../asyncStorage/AsyncStorageUtils", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 1));
  return {
    AsyncStorageUtils: {
      getItem: async (key: string) => {
        await tick();
        return mockStorage[key] ? JSON.parse(mockStorage[key]) : null;
      },
      setItem: async (key: string, value: unknown) => {
        await tick();
        mockStorage[key] = JSON.stringify(value);
      },
    },
  };
});
jest.mock("../api", () => ({ API: {} }));
jest.mock("utils/SystemUtils", () => ({ SystemUtils: {} }));

describe("SettingsService.updateSetting", () => {
  it("persists overlapping updates", async () => {
    await Promise.all([
      SettingsService.updateSetting({ key: "fontScale", value: 2 }),
      SettingsService.updateSetting({
        key: "animationsEnabled",
        value: false,
      }),
    ]);
    const stored = JSON.parse(Object.values(mockStorage)[0]!);
    expect(stored.fontScale).toBe(2);
    expect(stored.animationsEnabled).toBe(false);
  });
});

describe("SettingsService.updateSettings", () => {
  it("doesn't drop updates made while other updates are pending", async () => {
    await Promise.all([
      SettingsService.updateSetting({ key: "fontScale", value: 3 }),
      SettingsService.updateSettings((settings) => ({
        ...settings,
        importedMaps: [{ id: "map" } as ImportedMap],
      })),
    ]);
    const stored = JSON.parse(Object.values(mockStorage)[0]!);
    expect(stored.fontScale).toBe(3);
    expect(stored.importedMaps).toEqual([{ id: "map" }]);
  });
});

describe("SettingsService.fetchSettings", () => {
  it("migrates the PDF maps stored by version 2.11.3", async () => {
    mockStorage["@settings"] = JSON.stringify({
      fontScale: 2,
      pdfMaps: [{ id: "map" }],
    });
    let service: typeof SettingsService | undefined;
    jest.isolateModules(() => {
      service = require("./settingsService").SettingsService;
    });
    const settings = await service!.fetchSettings();
    expect(settings.importedMaps).toEqual([{ id: "map" }]);
    expect(settings).not.toHaveProperty("pdfMaps");

    await service!.updateSetting({ key: "fontScale", value: 3 });
    const stored = JSON.parse(mockStorage["@settings"]);
    expect(stored.importedMaps).toEqual([{ id: "map" }]);
    expect(stored).not.toHaveProperty("pdfMaps");
  });
});
