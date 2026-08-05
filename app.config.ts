import { ExpoConfig } from "expo/config";

const appVersion = "2.7.1";
const buildNumber = 114;

const basePlugins: ExpoConfig["plugins"] = [
  ["expo-asset", { assets: ["assets"] }],
  [
    "expo-build-properties",
    {
      ios: { deploymentTarget: "16.4" },
    },
  ],
  [
    "expo-splash-screen",
    {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
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
  [
    "expo-audio",
    {
      // The app only records/plays audio file attributes while the record
      // editor screen is open - it has no persistent background-audio
      // feature, so the default UIBackgroundModes "audio" entry (and the
      // Android foreground media-playback service) must stay disabled.
      enableBackgroundPlayback: false,
    },
  ],
  "expo-localization",
  "expo-secure-store",
  "expo-sharing",
  "expo-sqlite",
  "expo-status-bar",
  "expo-web-browser",
  "@react-native-community/datetimepicker",
];

const config = (): ExpoConfig => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY_ANDROID;
  const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY_IOS;

  const plugins: ExpoConfig["plugins"] = [
    ...basePlugins,
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey,
        iosGoogleMapsApiKey,
      },
    ],
  ];

  return {
    name: "Arena Mobile",
    slug: "arena-mobile",
    owner: "openforis",
    version: appVersion,
    icon: "./assets/logo/icon_with_margin.png",
    userInterfaceStyle: "automatic",
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
      versionCode: buildNumber,
      permissions: [
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.RECORD_AUDIO",
        // For scanning, pairing, and connecting to an external Bluetooth GPS receiver
        // over Classic SPP. BLUETOOTH/BLUETOOTH_ADMIN cover API < 31; BLUETOOTH_CONNECT
        // and BLUETOOTH_SCAN are the API 31+ runtime permissions (requested via
        // Permissions.requestBluetoothPermissions()/requestBluetoothScanPermissions()).
        // Location permission for pre-API-31 discovery is NOT declared here separately -
        // ACCESS_FINE_LOCATION/ACCESS_COARSE_LOCATION are already pulled in transitively
        // by expo-location (used for internal GPS); requestBluetoothScanPermissions()
        // reuses the app's existing foreground-location request for that runtime check.
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
      ],
    },
    ios: {
      buildNumber: buildNumber.toString(),
      bundleIdentifier: "org.openforis.arena-mobile",
      config: {
        usesNonExemptEncryption: false,
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
          "Device's acceleraometer is used only when using the 'navigator' in coordinate attributes (if defined in your survey).",
        NSPhotoLibraryUsageDescription:
          "Access to the photo library is required only when selecting images to be used in file attributes (if defined in your survey).",
        NSBluetoothAlwaysUsageDescription:
          "Bluetooth is used to connect to an external GPS receiver (if paired in the device's Bluetooth settings) for higher-accuracy coordinate attributes.",
        // MFi External Accessory protocol strings, one per supported external GPS
        // vendor - must match the accessory's own advertised protocol exactly (see
        // service/externalGps/transport/vendorProtocolRegistry.ts).
        UISupportedExternalAccessoryProtocols: ["com.bad-elf.gps"],
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
