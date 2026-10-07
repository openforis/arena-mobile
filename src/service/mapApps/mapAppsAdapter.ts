// the only file allowed to import react-native-map-link
import { getApps, MapId, showLocation } from "react-native-map-link";
import { ImageRequireSource } from "react-native";

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

const appsWhiteList = supportedMapApps.appIds as MapId[];

const getInstalledMapApps = async ({
  latitude,
  longitude,
}: MapAppLocation): Promise<MapApp[]> => {
  const apps = await getApps({ latitude, longitude, appsWhiteList });
  return apps.map(({ id, name, icon }) => ({ id, name, icon }));
};

const openMapApp = async ({
  appId,
  latitude,
  longitude,
  title,
}: MapAppLocation & { appId: string }): Promise<void> => {
  await showLocation({
    latitude,
    longitude,
    title,
    app: appId as MapId,
    appsWhiteList,
  });
};

export const MapAppsAdapter = { getInstalledMapApps, openMapApp };
