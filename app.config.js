// Dynamic Expo config extending app.json.
// Allows reading environment variables (e.g. GOOGLE_MAPS_API_KEY) at build time.
// See: https://docs.expo.dev/workflow/configuration/#dynamic-configuration

/** @type {import("@expo/config").ExpoConfig} */
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
          iosGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
  };
};
