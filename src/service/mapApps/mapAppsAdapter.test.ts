import { getApps, showLocation } from "react-native-map-link";

import { GeoIntent } from "./GeoIntent";
import { MapAppsAdapter, otherAppChoiceId } from "./mapAppsAdapter";

jest.mock("react-native-map-link", () => ({
  getApps: jest.fn(),
  showLocation: jest.fn(),
}));
jest.mock("react-native", () => ({ Linking: { openURL: jest.fn() } }));
jest.mock("utils", () => ({ Environment: { isAndroid: true } }));
jest.mock("./GeoIntent", () => ({
  GeoIntent: {
    isAvailable: jest.fn(() => true),
    getHandlerPackages: jest.fn(),
    open: jest.fn(),
  },
}));

const location = { latitude: 1.5, longitude: 2.5 };
const geoUri = "geo:1.5,2.5?q=1.5,2.5";

describe("MapAppsAdapter (Android)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApps as jest.Mock).mockResolvedValue([
      { id: "google-maps", name: "Google Maps" },
    ]);
    (GeoIntent.getHandlerPackages as jest.Mock).mockReturnValue([
      "app.organicmaps",
      "com.mapswithme.maps.pro",
    ]);
  });

  test("lists MAPS.ME and Organic Maps by package, plus the other app choice", async () => {
    const apps = await MapAppsAdapter.getInstalledMapApps(location);
    expect(apps.map((app) => app.id)).toEqual([
      "google-maps",
      "maps-me",
      "organic-maps",
      otherAppChoiceId,
    ]);
    const { appsWhiteList } = (getApps as jest.Mock).mock.calls[0][0];
    expect(appsWhiteList).not.toContain("maps-me");
  });

  test("opens Organic Maps through its package", async () => {
    await MapAppsAdapter.openMapApp({ appId: "organic-maps", ...location });
    expect(GeoIntent.open).toHaveBeenCalledWith(geoUri, "app.organicmaps");
    expect(showLocation).not.toHaveBeenCalled();
  });

  test("opens the system chooser for the other app choice", async () => {
    await MapAppsAdapter.openMapApp({ appId: otherAppChoiceId, ...location });
    expect(GeoIntent.open).toHaveBeenCalledWith(geoUri);
  });

  test("opens the other apps through react-native-map-link", async () => {
    await MapAppsAdapter.openMapApp({ appId: "google-maps", ...location });
    expect(showLocation).toHaveBeenCalledWith(
      expect.objectContaining({ app: "google-maps", ...location }),
    );
  });
});
