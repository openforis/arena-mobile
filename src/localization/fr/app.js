export default {
  backup: "Sauvegarde",
  changelog: "Journal des modifications",
  confirmExit: {
    title: "Quitter",
    message:
      "Quitter l'application?\nToutes les modifications sont déjà enregistrées.",
  },
  currentVersion: "Version actuelle",
  fullBackup: {
    confirmMessage:
      "Générer une sauvegarde complète?\nLa taille sera d'environ {{size}}.",
    confirmTitle: "Générer une sauvegarde",
    error:
      "Erreur lors de la génération de la sauvegarde complète: {{details}}",
    shareTitle: "Partager la sauvegarde complète AME",
    title: "Sauvegarde complète",
  },
  initializationStep: {
    starting: "démarrage",
    fetchingDeviceInfo: "Récupération des informations de l'appareil",
    fetchingSettings: "Récupération des paramètres",
    storingSettings: "Enregistrement des paramètres",
    settingFullScreen: "Définition du plein écran",
    settingKeepScreenAwake: "Définition du maintien de l'écran allumé",
    startingGpsLocking: "Démarrage du verrouillage GPS",
    initializingDb: "Initialisation de la base de données",
    startingDbMigrations: "Démarrage des migrations de la base de données",
    fetchingSurveys: "Récupération des enquêtes",
    importingDemoSurvey: "Importation de l'enquête de démonstration",
    fetchingAndSettingLocalSurveys:
      "Récupération et configuration des enquêtes locales",
    fetchingAndSettingSurvey: "Récupération et configuration de l'enquête",
    checkingLoggedIn: "Vérification de la connexion",
    complete: "Terminé",
  },
  pleaseWaitMessage: "Veuillez patienter...",
  update: "Mettre à jour",
  updateAvailable: "Mise à jour disponible",
  updateStatus: {
    error:
      "Erreur lors de la récupération de l'état de la mise à jour de l'application: {{error}}",
    networkNotAvailable:
      "Impossible de vérifier l'état de la mise à jour de l'application: $t(networkNotAvailable)",
    upToDate: "Application à jour",
  },
};
