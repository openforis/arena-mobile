export default {
  title: "Settings",
  animationsEnabled: "Animations enabled",
  connectionToRemoteServer: "Connection to remote server",
  fontScale: "Font scale (BETA): {{value}}",
  keepScreenAwake: "Keep screen awake",
  fullScreen: "Full screen",
  language: {
    label: "Application language",
  },
  locationAccuracyThreshold: "Location accuracy threshold (meters)",
  locationAccuracyWatchTimeout:
    "Location accuracy watch timeout: {{value}} seconds",
  locationGpsLocked: {
    label: "GPS locked (BETA)",
    description: `Warning: battery consumption will increase! 
GPS signal will be locked when the application is running. 
It will help to get a better accuracy in a coordinate attributes.`,
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
