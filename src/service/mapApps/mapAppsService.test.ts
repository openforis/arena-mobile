import { MapAppsService } from "./mapAppsService";
import { MapAppsAdapter } from "./mapAppsAdapter";
import { PreferencesService } from "../preferencesService";

jest.mock("./mapAppsAdapter", () => ({
  MapAppsAdapter: { getInstalledMapApps: jest.fn(), openMapApp: jest.fn() },
}));
jest.mock("../preferencesService", () => ({
  PreferencesService: {
    getLastUsedMapAppId: jest.fn(),
    setLastUsedMapAppId: jest.fn(),
  },
}));

const location = { latitude: 1, longitude: 2 };
const apps = [
  { id: "google-maps", name: "Google Maps" },
  { id: "osmand", name: "OsmAnd" },
];

describe("MapAppsService", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lists the last used app first", async () => {
    (MapAppsAdapter.getInstalledMapApps as jest.Mock).mockResolvedValue(apps);
    (PreferencesService.getLastUsedMapAppId as jest.Mock).mockResolvedValue(
      "osmand",
    );
    const result = await MapAppsService.getInstalledApps(location);
    expect(result.map((app) => app.id)).toEqual(["osmand", "google-maps"]);
  });

  test("keeps the order when there is no last used app", async () => {
    (MapAppsAdapter.getInstalledMapApps as jest.Mock).mockResolvedValue(apps);
    (PreferencesService.getLastUsedMapAppId as jest.Mock).mockResolvedValue(
      undefined,
    );
    const result = await MapAppsService.getInstalledApps(location);
    expect(result.map((app) => app.id)).toEqual(["google-maps", "osmand"]);
  });

  test("opens the app and stores it as last used", async () => {
    await MapAppsService.openApp("osmand", location);
    expect(MapAppsAdapter.openMapApp).toHaveBeenCalledWith({
      appId: "osmand",
      ...location,
    });
    expect(PreferencesService.setLastUsedMapAppId).toHaveBeenCalledWith(
      "osmand",
    );
  });
});
