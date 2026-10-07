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

const mockLastChoice = (id: string | undefined) =>
  (PreferencesService.getLastUsedMapAppId as jest.Mock).mockResolvedValue(id);

describe("MapAppsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (MapAppsAdapter.getInstalledMapApps as jest.Mock).mockResolvedValue(apps);
  });

  test("preselects the last used installed app", async () => {
    mockLastChoice("osmand");
    const result = await MapAppsService.loadChoices(location);
    expect(result.selectedId).toBe("osmand");
    expect(result.apps.map((app) => app.id)).toEqual(["google-maps", "osmand"]);
  });

  test("preselects the in-app viewer when it was the last choice", async () => {
    mockLastChoice(MapAppsService.inAppChoiceId);
    const result = await MapAppsService.loadChoices(location);
    expect(result.selectedId).toBe(MapAppsService.inAppChoiceId);
  });

  test.each([undefined, "waze"])(
    "falls back to the in-app viewer when last choice is %s",
    async (lastChoice) => {
      mockLastChoice(lastChoice);
      const result = await MapAppsService.loadChoices(location);
      expect(result.selectedId).toBe(MapAppsService.inAppChoiceId);
    },
  );

  test("opens the app", async () => {
    await MapAppsService.openApp("osmand", location);
    expect(MapAppsAdapter.openMapApp).toHaveBeenCalledWith({
      appId: "osmand",
      ...location,
    });
  });

  test("remembers the choice", async () => {
    await MapAppsService.rememberChoice("osmand");
    expect(PreferencesService.setLastUsedMapAppId).toHaveBeenCalledWith(
      "osmand",
    );
  });
});
