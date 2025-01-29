export default {
  backup: "Backup",
  changelog: "Change Log",
  confirmExit: {
    title: "Exit",
    message: `Exit from the app?
All changes are already saved.`,
  },
  currentVersion: "Current version",
  fullBackup: {
    confirmMessage: `Generate a full backup? 
The size will be around {{size}}.`,
    confirmTitle: "Generate backup",
    error: "Error generating full backup: {{details}}",
    shareTitle: "Share AME full backup",
    title: "Full backup",
  },
  initializationStep: {
    starting: "starting",
    fetchingDeviceInfo: "Fetching device info",
    fetchingSettings: "Fetching settings",
    storingSettings: "Storing settings",
    settingFullScreen: "Setting full screen",
    settingKeepScreenAwake: "setting keep screen awake",
    startingGpsLocking: "Starting GPS locking",
    initializingDb: "Initializing DB",
    startingDbMigrations: "Starting DB migrations",
    fetchingSurveys: "Fetching surveys",
    importingDemoSurvey: "Importing Demo survey",
    fetchingAndSettingLocalSurveys: "Fetching and setting local surveys",
    fetchingAndSettingSurvey: "Fetching and setting survey",
    checkingLoggedIn: "Checking logged in",
    complete: "Complete",
  },
  pleaseWaitMessage: "Please wait...",
  update: "Update",
  updateAvailable: "Update available",
  updateStatus: {
    error: "Error retrieving application update status: {{error}}",
    networkNotAvailable:
      "Cannot verify application update status: $t(networkNotAvailable)",
    upToDate: "Application up-to-date",
  },
};
