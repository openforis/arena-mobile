export default {
  title: "Paramètres",
  animationsEnabled: "Animations activées",
  connectionToServer: "Connexion au serveur",
  fontScale: "Échelle de la police: {{value}}",
  keepScreenAwake: "Maintenir l'écran allumé",
  fullScreen: "Plein écran",
  imageSizeLimit: "Taille des images limitée à: {{value}}MB",
  imageSizeUnlimited: {
    label: "Taille des images illimitée",
    description:
      "Les images seront stockées dans la résolution maximale fournie par l'appareil, à moins qu'une limite ne soit définie dans le concepteur du formulaire d'enquête.",
  },
  language: {
    label: "Langue de l'application",
  },
  locationAccuracyThreshold: "Seuil de précision de la localisation (mètres)",
  locationAccuracyWatchTimeout:
    "Délai de surveillance de la précision de la localisation: {{value}} secondes",
  locationAveragingEnabled: {
    label: "Moyenne de localisation activée",
    description:
      "Lorsqu'elle est activée, la localisation enregistrée sera la moyenne de plusieurs lectures de localisation, améliorant la précision",
  },
  locationGpsLocked: {
    label: "GPS verrouillé",
    description:
      "Avertissement: la consommation de la batterie augmentera!\nLe signal GPS sera verrouillé lorsque l'application est en cours d'exécution.\nCela aidera à obtenir une meilleure précision dans les attributs de coordonnées.",
    error:
      "Impossible de démarrer le verrouillage GPS: fournisseur de localisation non disponible ou accès à la localisation non accordé",
  },
  gpsDevicePairing: {
    title: "Associer un appareil GPS",
    scanButton: "Rechercher des appareils",
    scanningLabel: "Recherche d'appareils à proximité…",
    scanAgainButton: "Rechercher à nouveau",
    emptyResult:
      "Aucun appareil trouvé. Assurez-vous que votre récepteur GPS est allumé et en mode d'appairage.",
    scanFailed: "Une erreur s'est produite pendant la recherche. Veuillez réessayer.",
    showAllDevices: "Afficher tous les appareils à proximité",
    pairButton: "Associer",
    pairing: "Association en cours…",
    pairingSucceeded: "Associé avec {{name}}",
    pairingFailed: "Impossible de s'associer avec {{name}}",
    bluetoothDisabled: "Le Bluetooth est désactivé.",
    enableBluetoothButton: "Activer le Bluetooth",
    permissionDenied:
      "L'autorisation Bluetooth est requise pour rechercher des appareils.",
    openSettingsButton: "Ouvrir les paramètres de l'application",
  },
  preferredGpsSourceId: {
    label: "Source GPS",
    description:
      "Choisissez le GPS utilisé pour enregistrer les coordonnées : le GPS interne du téléphone ou un récepteur GPS externe apparié (par exemple, Bad Elf).",
    auto: "Auto (externe si disponible)",
    internal: "GPS interne",
    pairNewDevice: "Associer un nouvel appareil…",
  },
  showStatusBar: "Afficher la barre d'état",
  theme: {
    label: "Thème",
    auto: "Automatique",
    dark: "Sombre",
    dark2: "Sombre 2",
    light: "Clair",
    light2: "Clair 2",
  },
};
