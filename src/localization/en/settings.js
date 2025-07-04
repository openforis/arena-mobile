export default {
  title: "Settings",
  animationsEnabled: "Animations enabled",
  connectionToServer: "Connection to server",
  fontScale: "Font scale: {{value}}",
  keepScreenAwake: "Keep screen awake",
  fullScreen: "Full screen",
  imageSizeLimit: "Images size limited to: {{value}}MB",
  imageSizeUnlimited: {
    label: "Images size not limited",
    description:
      "Images will be stored in the maximum resolution provided by the device, unless a limit is set in the survey form designer",
  },
  language: {
    label: "Application language",
  },
  locationAccuracyThreshold: "Location accuracy threshold (meters)",
  locationAccuracyWatchTimeout:
    "Location accuracy watch timeout: {{value}} seconds",
  locationGpsLocked: {
    label: "GPS locked",
    description: `Warning: battery consumption will increase! 
GPS signal will be locked when the application is running. 
It will help to get a better accuracy in coordinate attributes.`,
    error:
      "Cannot start GPS locking: location provider not available or access to location not granted",
  },
  showStatusBar: "Show status bar",
  theme: {
    label: "Theme",
    auto: "Auto",
    dark: "Dark",
    dark2: "Dark 2",
    light: "Light",
    light2: "Light 2",
  },
};
