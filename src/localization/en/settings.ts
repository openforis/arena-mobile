export default {
  title: "Settings",
  animationsEnabled: {
    label: "Animations enabled",
    description:
      "Enables transition and interface animations throughout the app. Disable to improve performance on slower devices",
  },
  connectionToServer: "Connection to server",
  fontScale: {
    label: "Font scale: {{value}}",
    description: "Adjusts the size of the text used throughout the app",
  },
  keepScreenAwake: {
    label: "Keep screen awake",
    description:
      "Prevents the screen from turning off automatically while the app is open",
  },
  fullScreen: {
    label: "Full screen",
    description:
      "Hides the system status and navigation bars to use the full screen for data entry",
  },
  imageSizeLimit: {
    label: "Images size limited to: {{value}}MB",
    description:
      "Maximum size images are resized to before being saved, unless the survey defines a smaller limit for a specific attribute",
  },
  imageSizeUnlimited: {
    label: "Images size not limited",
    description:
      "Images will be stored in the maximum resolution provided by the device, unless a limit is set in the survey form designer",
  },
  language: {
    label: "Application language",
    description: "Sets the language used throughout the app interface",
  },
  locationAccuracyThreshold: {
    label: "Location accuracy threshold (meters)",
    description:
      "Minimum GPS accuracy, in meters, required before a location reading is accepted for a coordinate attribute",
  },
  locationAccuracyWatchTimeout: {
    label: "Location accuracy watch timeout: {{value}} seconds",
    description:
      "Maximum time to wait for a location reading that meets the accuracy threshold before giving up",
  },
  locationAveragingEnabled: {
    label: "Location averaging enabled",
    description:
      "When enabled, the recorded location will be the average of multiple location readings, improving accuracy",
  },
  locationGpsLocked: {
    label: "GPS locked",
    description: `Warning: battery consumption will increase!
GPS signal will be locked when the application is running.
It will help to get a better accuracy in coordinate attributes.`,
    error:
      "Cannot start GPS locking: location provider not available or access to location not granted",
  },
  gpsDevicePairing: {
    title: "Pair a GPS device",
    scanButton: "Scan for devices",
    scanningLabel: "Scanning for nearby devices…",
    scanAgainButton: "Scan again",
    emptyResult:
      "No devices found. Make sure your GPS receiver is powered on and in pairing mode.",
    scanFailed: "Something went wrong while scanning. Please try again.",
    recognizedDevicesNotice: "Only devices recognized as GPS receivers are shown.",
    pairedDevicesTitle: "Paired devices",
    newDevicesTitle: "New devices",
    pairButton: "Pair",
    pairing: "Pairing…",
    pairingSucceeded: "Paired with {{name}}",
    pairingFailed: "Could not pair with {{name}}",
    bluetoothDisabled: "Bluetooth is turned off.",
    enableBluetoothButton: "Enable Bluetooth",
    permissionDenied: "Bluetooth permission is required to scan for devices.",
    openSettingsButton: "Open app settings",
  },
  preferredGpsSourceId: {
    label: "GPS source",
    description:
      "Choose which GPS is used to record coordinates: the phone's internal GPS, or a paired external GPS receiver (e.g. Bad Elf).",
    auto: "Auto (external if available)",
    internal: "Internal GPS",
    pairNewDevice: "Pair a new device…",
  },

  showRecordCompletion: {
    label: "Show record completion progress",
    description:
      "Shows a progress bar with the percentage of required fields filled in for the current record",
  },
  showStatusBar: {
    label: "Show status bar",
    description:
      "Shows battery, storage and network status while editing a record",
  },
  theme: {
    label: "Theme",
    description: "Sets the color theme used throughout the app interface",
    auto: "Auto",
    dark: "Dark",
    dark2: "Dark 2",
    light: "Light",
    light2: "Light 2",
  },
};
