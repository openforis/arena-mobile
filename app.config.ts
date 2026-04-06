/// <reference types="node" />
import { ExpoConfig } from "expo/config";

const upsertPlugin = (
  plugins: ExpoConfig["plugins"] = [],
  pluginName: string,
  pluginConfig: Record<string, unknown>,
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

const basePlugins: ExpoConfig["plugins"] = [
  ["expo-asset", { assets: ["assets"] }],
  [
    "expo-build-properties",
    {
      ios: { deploymentTarget: "15.5" },
    },
  ],
  [
    "expo-image-picker",
    {
      photosPermission:
        "Please allow $(PRODUCT_NAME) access to your photos to attach them to your records.",
    },
  ],
  [
    "./plugins/modifyAndroidManifestAttributes",
    {
      application: {
        "android:hardwareAccelerated": "true",
        "android:largeHeap": "true",
      },
    },
  ],
  "expo-asset",
  "expo-audio",
  "expo-localization",
  "expo-secure-store",
  "expo-sharing",
  "expo-sqlite",
  "expo-web-browser",
  "@react-native-community/datetimepicker",
];

const config = (): ExpoConfig => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY_ANDROID;
  const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY_IOS;

  const plugins =
    androidGoogleMapsApiKey && iosGoogleMapsApiKey
      ? upsertPlugin(basePlugins, "react-native-maps", {
          androidGoogleMapsApiKey,
          iosGoogleMapsApiKey,
        })
      : basePlugins;

  return {
    name: "Arena Mobile",
    slug: "arena-mobile",
    owner: "openforis",
    version: "2.5.0",
    icon: "./assets/logo/icon_with_margin.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo/adaptive_icon_with_margin.png",
        backgroundColor: "#FFFFFF",
      },
      package: "org.openforis.arena_mobile",
      versionCode: 82,
      permissions: [
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.RECORD_AUDIO",
      ],
      config: {
        googleMaps: {
          apiKey: androidGoogleMapsApiKey,
        },
      },
    },
    ios: {
      buildNumber: "82",
      bundleIdentifier: "org.openforis.arena-mobile",
      config: {
        usesNonExemptEncryption: false,
        googleMapsApiKey: iosGoogleMapsApiKey,
      },
      infoPlist: {
        LSMinimumSystemVersion: "13.0",
        NSCameraUsageDescription:
          "Camera is used only when collecting images in file attributes (if defined in your survey).",
        NSLocationWhenInUseUsageDescription:
          "Location is used only when collecting coordinates in coordinate attributes (if defined in your survey).",
        NSMicrophoneUsageDescription:
          "Microphone is used only when recording audio or video in file attributes (if defined in your survey).",
        NSMotionUsageDescription:
          "Devices's acceleraometer is used only when using the 'navigator' in coordinate attributes (if defined in your survey).",
        NSPhotoLibraryUsageDescription:
          "Access to the photo library is required only when selecting images to be used in file attributes (if defined in your survey).",
      },
      supportsTablet: true,
    },
    web: {
      favicon: "./assets/logo/favicon.png",
    },
    extra: {
      eas: {
        projectId: "adc829ff-2bf8-4733-9e03-051d16d0f9ca",
      },
    },
    plugins,
  };
};

export default config;
