import { PreferencesService } from "../preferencesService";
import { MapApp, MapAppsAdapter } from "./mapAppsAdapter";

export type { MapApp };

type Location = { latitude: number; longitude: number; title?: string };

const inAppChoiceId = "inApp";

// installed apps and the choice to preselect (last one used, if still available)
const loadChoices = async (
  location: Location,
): Promise<{ apps: MapApp[]; selectedId: string }> => {
  const [apps, lastChoiceId] = await Promise.all([
    MapAppsAdapter.getInstalledMapApps(location),
    PreferencesService.getLastUsedMapAppId(),
  ]);
  const lastChoiceAvailable =
    lastChoiceId === inAppChoiceId || apps.some((app) => app.id === lastChoiceId);
  return { apps, selectedId: lastChoiceAvailable ? lastChoiceId! : inAppChoiceId };
};

const rememberChoice = async (choiceId: string): Promise<void> => {
  await PreferencesService.setLastUsedMapAppId(choiceId);
};

const openApp = async (appId: string, location: Location): Promise<void> => {
  await MapAppsAdapter.openMapApp({ appId, ...location });
};

export const MapAppsService = {
  inAppChoiceId,
  loadChoices,
  openApp,
  rememberChoice,
};
