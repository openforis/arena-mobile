import { ExpoConfig } from "expo/config";

const { expo } = require("./app.json") as { expo: ExpoConfig };

export default (): ExpoConfig => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

  return {
    ...expo,
    android: {
      ...expo.android,
      config: {
        ...expo.android?.config,
        googleMaps: {
          ...expo.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...expo.ios,
      config: {
        ...expo.ios?.config,
        googleMapsApiKey,
      },
    },
  };
};
