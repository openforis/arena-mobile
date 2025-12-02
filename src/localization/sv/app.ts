export default {
  backup: "Säkerhetskopia",
  changelog: "Ändringslogg",
  confirmExit: {
    title: "Avsluta",
    message: `Avsluta appen?
  Alla ändringar är redan sparade.`,
  },
  currentVersion: "Nuvarande version",
  fullBackup: {
    confirmMessage: `Generera en fullständig säkerhetskopia?
  Storleken kommer att vara cirka {{size}}.`,
    confirmTitle: "Generera säkerhetskopia",
    error: "Fel vid generering av fullständig säkerhetskopia: {{details}}",
    shareTitle: "Dela AM fullständig säkerhetskopia",
    title: "Fullständig säkerhetskopia",
  },
  initializationStep: {
    starting: "startar",
    fetchingDeviceInfo: "Hämtar enhetsinfo",
    fetchingSettings: "Hämtar inställningar",
    storingSettings: "Lagrar inställningar",
    settingFullScreen: "Ställer in helskärm",
    settingKeepScreenAwake: "Ställer in att hålla skärmen vaken",
    startingGpsLocking: "Startar GPS-låsning",
    initializingDb: "Initierar databas",
    startingDbMigrations: "Startar databasmigreringar",
    fetchingSurveys: "Hämtar enkäter",
    importingDemoSurvey: "Importerar demoenkät",
    fetchingAndSettingLocalSurveys: "Hämtar och ställer in lokala enkäter",
    fetchingAndSettingSurvey: "Hämtar och ställer in enkät",
    checkingLoggedIn: "Kontrollerar inloggad",
    complete: "Slutfört",
  },
  logs: {
    title: "Loggar",
    clear: {
      label: "Rensa loggar",
      confirmMessage: "Är du säker på att du vill radera alla loggfiler?",
    },
    exportLabel: "Exportera loggar",
  },
  pleaseWaitMessage: "Vänta...",
  update: "Uppdatera",
  updateAvailable: "Uppdatering tillgänglig",
  updateStatus: {
    error: "Fel vid hämtning av applikationsuppdateringsstatus: {{error}}",
    networkNotAvailable:
      "Kan inte verifiera applikationsuppdateringsstatus: $t(networkNotAvailable)",
    upToDate: "Applikationen är uppdaterad",
  },
};
