export default {
  confirmGoToListOfRecords:
    "Aller à la liste des enregistrements?\n\n(toutes les modifications sont déjà enregistrées)",
  checkSyncStatus: "Vérifier synchronisation",
  closestSamplingPoint: {
    findClosestSamplingPoint:
      "Trouver le point d'échantillonnage le plus proche",
    findingClosestSamplingPoint:
      "Recherche du point d'échantillonnage le plus proche",
    minDistanceItemFound: "Élément trouvé à une distance de {{minDistance}}m",
    minDistanceItemFound_plural:
      "Éléments trouvés à une distance de {{minDistance}}m",
    useSelectedItem: "Utiliser l'élément sélectionné",
  },
  confirmDeleteSelectedItems: {
    message: "Supprimer les éléments sélectionnés?",
  },
  confirmDeleteValue: {
    message: "Supprimer cette valeur?",
  },
  confirmOverwriteValue: {
    message: "Remplacer la valeur existante?",
  },
  cycle: "Cycle",
  cycleForNewRecords: "Cycle pour les nouveaux enregistrements:",
  options: "Options",
  editNodeDef: "Modifier {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Erreur lors de la récupération des enregistrements depuis le serveur.\n\nVérifier les paramètres de connexion.\n\nDétails: {{details}}",
  errorGeneratingRecordsExportFile:
    "Erreur lors de la génération du fichier d'exportation des enregistrements: {{details}}",
  errorLoadingRecords:
    "Erreur lors du chargement des enregistrements: {{details}}",
  exportData: {
    title: "Exporter les données",
    confirm: {
      title: "Confirmer l'exportation des données",
      message:
        "Enregistrements à exporter:\n- {{newRecordsCount}} nouveaux enregistrements;\n- {{updatedRecordsCount}} enregistrements mis à jour\n- {{conflictingRecordsCount}} enregistrements conflictuels",
    },
    noRecordsInDeviceToExport: "Aucun enregistrement à exporter sur l'appareil",
    onlyNewOrUpdatedRecords:
      "Exporter uniquement les enregistrements nouveaux ou mis à jour",
    mergeConflictingRecords:
      "Fusionner les enregistrements conflictuels (mêmes clés)",
    onlyRecordsInRemoteServerCanBeImported:
      "Seuls les enregistrements déjà présents sur le serveur distant ou les enregistrements qui ont été mis à jour à distance peuvent être importés",
  },
  exportNewOrUpdatedRecords:
    "Exporter les nouveaux enregistrements ou les enregistrements mis à jour",
  formLanguage: "Langue du formulaire:",
  noEntitiesDefined: "Aucune entité définie",
  goToDataEntry: "Aller à la saisie de données",
  goToListOfRecords: "Aller à la liste des enregistrements",
  gpsLockingEnabledWarning: "Avertissement: Verrouillage GPS activé!",
  listOfRecords: "Liste des enregistrements",
  localBackup: "Sauvegarde locale",
  newRecord: "Nouvel",
  noRecordsFound: "Aucun enregistrement trouvé",
  recordEditor: "Éditeur d'enregistrements",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Afficher les valeurs du cycle précédent",
      message: "Sélectionner le cycle précédent:",
      cycleItem: "Cycle {{cycleLabel}}",
    },
    foundMessage: "Enregistrement trouvé dans le cycle précédent!",
    notFoundMessage:
      "Enregistrement introuvable dans le cycle {{cycle}} avec les clés {{keyValues}}",
    confirmFetchRecordInCycle:
      "L'enregistrement du cycle {{cycle}} avec les clés {{keyValues}} n'est pas entièrement chargé; le télécharger depuis le serveur?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): récupérer la liste des enregistrements depuis le serveur et réessayer?",
    fetchError:
      "Erreur lors de la récupération de l'enregistrement du cycle précédent: {{details}}",
    multipleRecordsFound:
      "Plusieurs enregistrements avec les clés {{keyValues}} trouvés dans le cycle {{cycle}}",
    valuePanelHeader: "Valeur dans le cycle {{prevCycle}}",
  },
  sendData: "Envoyer données",
  showOnlyLocalRecords: "Afficher uniquement les enregistrements locaux",
  syncedOn: "Synchronisé le",
  syncStatusHeader: "État",
  syncStatus: {
    conflictingKeys: "Un enregistrement avec la/les même(s) clé(s) existe déjà",
    keysNotSpecified: "Clé(s) non spécifiée(s)",
    new: "Nouveau (pas encore téléchargé)",
    notModified: "Non modifié (aucune modification à télécharger)",
    modifiedLocally: "Modifié localement",
    modifiedRemotely: "Modifié sur le serveur distant",
    notInEntryStepAnymore:
      "Plus à l'étape de saisie (à l'étape de nettoyage ou d'analyse)",
  },
  validationReport: {
    title: "Rapport de validation",
    noErrorsFound: "Bravo, aucune erreur trouvée!",
  },
  viewModeLabel: "Mode d'affichage",
  viewMode: {
    form: "Formulaire",
    oneNode: "Un nœud",
  },
  code: {
    selectItem: "Sélectionner un élément",
    selectItem_plural: "Sélectionner des éléments",
  },
  coordinate: {
    accuracy: "Précision (m)",
    altitude: "Altitude (m)",
    altitudeAccuracy: "Précision de l'altitude (m)",
    angleToTargetLocation: "Angle par rapport à la cible",
    confirmConvertCoordinate:
      "Convertir la coordonnée du SRS {{srsFrom}} vers le SRS {{srsTo}}?",
    convert: "Convertir",
    currentLocation: "Position actuelle",
    distance: "Distance (m)",
    getLocation: "Obtenir la position",
    heading: "Cap (deg)",
    keepXAndY: "Conserver X et Y",
    magnetometerNotAvailable: "Magnétomètre non disponible!",
    navigateToTarget: "Naviguer vers la cible",
    srs: "$t(common:srs)",
    useCurrentLocation: "Utiliser la position actuelle",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Rechercher un taxon",
    taxonNotSelected: "--- Taxon non sélectionné ---",
  },
  fileAttribute: {
    chooseAudio: "Choisir un fichier audio",
    chooseFile: "Choisir un fichier",
    choosePicture: "Choisir une image",
    chooseVideo: "Choisir une vidéo",
    deleteConfirmMessage: "Supprimer le fichier existant?",
  },
  fileAttributeImage: {
    imagePreview: "Aperçu de l'image",
    pictureResizedToSize: "Image redimensionnée à {{size}}",
    resolution: "Résolution",
  },
  dataExport: {
    error: "Erreur lors de l'exportation des données. Détails: {{details}}",
    selectTarget: "Sélectionner la cible d'exportation",
    selectTargetMessage: "Sélectionner la cible de l'exportation:",
    target: {
      remote: "Serveur distant",
      local: "Dossier local (Téléchargement)",
      share: "Partager le fichier",
    },
    shareExportedFile: "Partager le fichier exporté",
  },
  location: {
    gettingCurrentLocation: "Obtention de la position actuelle",
    usingCurrentLocation: "Utilisation de la position actuelle",
  },
  unlock: {
    label: "Déverrouiller",
    confirmMessage:
      "La modification de l'enregistrement est verrouillée; la déverrouiller?",
    confirmTitle: "Modification verrouillée",
  },
};
