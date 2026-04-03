import { ExpoConfig } from "expo/config";

const { expo } = require("./app.json") as { expo: ExpoConfig };

const config = (): ExpoConfig => {
  const googleMapsApiKeyAndroid = process.env.GOOGLE_MAPS_API_KEY_ANDROID;
  const googleMapsApiKeyIOS = process.env.GOOGLE_MAPS_API_KEY_IOS;

  return {
    ...expo,
    android: {
      ...expo.android,
      config: {
        ...expo.android?.config,
        googleMaps: {
          ...expo.android?.config?.googleMaps,
          apiKey:
            googleMapsApiKeyAndroid ?? expo.android?.config?.googleMaps?.apiKey,
        },
      },
    },
    ios: {
      ...expo.ios,
      config: {
        ...expo.ios?.config,
        googleMapsApiKey:
          googleMapsApiKeyIOS ?? expo.ios?.config?.googleMapsApiKey,
      },
    },
  };
};

export default config;
