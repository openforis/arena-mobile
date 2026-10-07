import { PreferencesService } from "../preferencesService";
import { MapApp, MapAppsAdapter } from "./mapAppsAdapter";

export type { MapApp };

type Location = { latitude: number; longitude: number; title?: string };

// installed apps, the last used one first
const getInstalledApps = async (location: Location): Promise<MapApp[]> => {
  const [apps, lastUsedAppId] = await Promise.all([
    MapAppsAdapter.getInstalledMapApps(location),
    PreferencesService.getLastUsedMapAppId(),
  ]);
  return [...apps].sort(
    (a, b) => Number(b.id === lastUsedAppId) - Number(a.id === lastUsedAppId),
  );
};

const openApp = async (appId: string, location: Location): Promise<void> => {
  await MapAppsAdapter.openMapApp({ appId, ...location });
  await PreferencesService.setLastUsedMapAppId(appId);
};

export const MapAppsService = { getInstalledApps, openApp };
