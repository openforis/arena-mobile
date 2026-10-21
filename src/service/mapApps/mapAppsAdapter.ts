// the only file allowed to import react-native-map-link
import { getApps, MapId, showLocation } from "react-native-map-link";
import { ImageRequireSource, Linking } from "react-native";

import { Environment } from "utils";

import { GeoIntent } from "./GeoIntent";
import supportedMapApps from "./supportedMapApps.json";

export type MapApp = {
  id: string;
  name: string;
  icon?: ImageRequireSource;
};

type MapAppLocation = {
  latitude: number;
  longitude: number;
  title?: string;
};

// Android: opens the system chooser with all the apps able to show a location
export const otherAppChoiceId = "otherApp";

const { androidGeoApps } = supportedMapApps;

// on Android these apps are opened through a geo: intent targeting their package
const androidGeoAppIds = new Set(androidGeoApps.map(({ id }) => id));

const appsWhiteList = (
  Environment.isAndroid
    ? supportedMapApps.appIds.filter((id) => !androidGeoAppIds.has(id))
    : supportedMapApps.appIds
) as MapId[];

const toGeoUri = ({ latitude, longitude }: MapAppLocation): string =>
  `geo:${latitude},${longitude}?q=${latitude},${longitude}`;

const getInstalledAndroidGeoApps = (
  location: MapAppLocation,
): { app: MapApp; packageName: string }[] => {
  if (!Environment.isAndroid || !GeoIntent.isAvailable()) return [];
  const handlerPackages = GeoIntent.getHandlerPackages(toGeoUri(location));
  return androidGeoApps.flatMap(({ id, name, packages }) => {
    const packageName = packages.find((pkg) => handlerPackages.includes(pkg));
    return packageName ? [{ app: { id, name }, packageName }] : [];
  });
};

const getInstalledMapApps = async (
  location: MapAppLocation,
): Promise<MapApp[]> => {
  const { latitude, longitude } = location;
  const apps: MapApp[] = (
    await getApps({ latitude, longitude, appsWhiteList })
  ).map(({ id, name, icon }) => ({ id, name, icon }));
  apps.push(...getInstalledAndroidGeoApps(location).map(({ app }) => app));
  if (Environment.isAndroid) {
    apps.push({ id: otherAppChoiceId, name: "" }); // name shown translated
  }
  return apps;
};

const openOtherApp = async (location: MapAppLocation): Promise<void> => {
  const uri = toGeoUri(location);
  if (GeoIntent.isAvailable()) {
    GeoIntent.open(uri);
  } else {
    await Linking.openURL(uri);
  }
};

const openMapApp = async ({
  appId,
  ...location
}: MapAppLocation & { appId: string }): Promise<void> => {
  if (appId === otherAppChoiceId) {
    await openOtherApp(location);
    return;
  }
  const geoApp = getInstalledAndroidGeoApps(location).find(
    ({ app }) => app.id === appId,
  );
  if (geoApp) {
    GeoIntent.open(toGeoUri(location), geoApp.packageName);
    return;
  }
  const { latitude, longitude, title } = location;
  await showLocation({
    latitude,
    longitude,
    title,
    app: appId as MapId,
    appsWhiteList,
  });
};

export const MapAppsAdapter = {
  getInstalledMapApps,
  openMapApp,
  otherAppChoiceId,
};
