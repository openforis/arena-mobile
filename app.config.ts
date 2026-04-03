/// <reference types="node" />
import { ExpoConfig } from "expo/config";

import appJson from "./app.json";

const { expo } = appJson as { expo: ExpoConfig };

const upsertPlugin = (
  plugins: ExpoConfig["plugins"] = [],
  pluginName: string,
  pluginConfig: Record<string, string>,
): ExpoConfig["plugins"] => {
  const nextPlugins = [...plugins];
  const index = nextPlugins.findIndex((plugin) =>
    Array.isArray(plugin) ? plugin[0] === pluginName : plugin === pluginName,
  );

  const nextPluginEntry: NonNullable<ExpoConfig["plugins"]>[number] = [
    pluginName,
    pluginConfig,
  ];

  if (index >= 0) {
    nextPlugins[index] = nextPluginEntry;
  } else {
    nextPlugins.push(nextPluginEntry);
  }

  return nextPlugins;
};

const config = (): ExpoConfig => {
  const androidGoogleMapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY_ANDROID ??
    expo.android?.config?.googleMaps?.apiKey;
  const iosGoogleMapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY_IOS ?? expo.ios?.config?.googleMapsApiKey;

  const plugins =
    androidGoogleMapsApiKey && iosGoogleMapsApiKey
      ? upsertPlugin(expo.plugins, "react-native-maps", {
          androidGoogleMapsApiKey,
          iosGoogleMapsApiKey,
        })
      : expo.plugins;

  return {
    ...expo,
    plugins,
    android: {
      ...expo.android,
      config: {
        ...expo.android?.config,
        googleMaps: {
          ...expo.android?.config?.googleMaps,
          apiKey:
            androidGoogleMapsApiKey ?? expo.android?.config?.googleMaps?.apiKey,
        },
      },
    },
    ios: {
      ...expo.ios,
      config: {
        ...expo.ios?.config,
        googleMapsApiKey:
          iosGoogleMapsApiKey ?? expo.ios?.config?.googleMapsApiKey,
      },
    },
  };
};

export default config;
