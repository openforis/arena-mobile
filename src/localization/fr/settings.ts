export default {
  title: "Paramètres",
  group: {
    appearance: "Apparence",
    dataEntry: "Saisie de données",
    location: "Localisation et GPS",
    images: "Images",
  },
  animationsEnabled: {
    label: "Animations activées",
    description:
      "Active les animations de transition et d'interface dans toute l'application. Désactivez pour améliorer les performances sur les appareils plus lents",
  },
  connectionToServer: "Connexion au serveur",
  fontScale: {
    label: "Échelle de la police: {{value}}",
    description:
      "Ajuste la taille du texte utilisé dans toute l'application",
  },
  keepScreenAwake: {
    label: "Maintenir l'écran allumé",
    description:
      "Empêche l'écran de s'éteindre automatiquement tant que l'application est ouverte",
  },
  fullScreen: {
    label: "Plein écran",
    description:
      "Masque les barres d'état et de navigation du système pour utiliser tout l'écran pour la saisie de données",
  },
  imageSizeLimit: {
    label: "Taille des images limitée à: {{value}}MB",
    description:
      "Taille maximale à laquelle les images sont redimensionnées avant d'être enregistrées, sauf si l'enquête définit une limite plus petite pour un attribut spécifique",
  },
  imageSizeUnlimited: {
    label: "Taille des images illimitée",
    description:
      "Les images seront stockées dans la résolution maximale fournie par l'appareil, à moins qu'une limite ne soit définie dans le concepteur du formulaire d'enquête.",
  },
  language: {
    label: "Langue de l'application",
    description: "Définit la langue utilisée dans l'interface de l'application",
  },
  locationAccuracyThreshold: {
    label: "Seuil de précision de la localisation (mètres)",
    description:
      "Précision GPS minimale, en mètres, requise avant qu'une lecture de localisation soit acceptée pour un attribut de coordonnées",
  },
  locationAccuracyWatchTimeout: {
    label:
      "Délai de surveillance de la précision de la localisation: {{value}} secondes",
    description:
      "Durée maximale d'attente d'une lecture de localisation atteignant le seuil de précision avant d'abandonner",
  },
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
    recognizedDevicesNotice:
      "Seuls les appareils reconnus comme récepteurs GPS sont affichés.",
    pairedDevicesTitle: "Appareils associés",
    newDevicesTitle: "Nouveaux appareils",
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
  showRecordCompletion: {
    label: "Afficher la progression de l'enregistrement",
    description:
      "Affiche une barre de progression indiquant le pourcentage des exigences remplies pour l'enregistrement en cours",
  },
  showStatusBar: {
    label: "Afficher la barre d'état",
    description:
      "Affiche l'état de la batterie, du stockage et du réseau pendant la modification d'un enregistrement",
  },
  theme: {
    label: "Thème",
    description: "Définit le thème de couleur utilisé dans l'interface de l'application",
    auto: "Automatique",
    dark: "Sombre",
    dark2: "Sombre 2",
    light: "Clair",
    light2: "Clair 2",
  },
};
