import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Cet enregistrement appartient à un autre groupe d'utilisateurs : il peut seulement être consulté. Clonez-le pour le modifier",
  autoSync: {
    checkbox: "Synchronisation automatique",
    synced: "{{count}} enregistrement synchronisé automatiquement",
    synced_other: "{{count}} enregistrements synchronisés automatiquement",
    statusLabel: "État de synchronisation :",
    statusTitle: "État de synchronisation",
    syncInProgressToast:
      "La synchronisation automatique est en cours. Veuillez attendre qu'elle se termine avant d'envoyer des données manuellement.",
    batteryDataWarning:
      "Peut augmenter la consommation de batterie et de données hors Wi-Fi",
    syncNow: "Synchroniser maintenant",
    recordSyncInProgress:
      "Cet enregistrement est en cours de synchronisation avec le serveur. Veuillez patienter un instant",
    status: {
      syncedTooltip:
        "Tous les enregistrements sont synchronisés avec le serveur",
      pendingTooltip:
        "Certains enregistrements doivent encore être synchronisés. Ils seront envoyés automatiquement",
      errorTooltip:
        "Certains enregistrements présentent des erreurs de synchronisation et nécessitent votre attention. Ouvrez « Envoyer données » pour les résoudre",
      needsManualFixTooltip:
        "Certains enregistrements ne peuvent pas être synchronisés tant que vous ne les avez pas corrigés (p. ex. valeurs clés manquantes, mêmes clés qu'un enregistrement déjà présent sur le serveur lorsque la fusion n'est pas autorisée, ou plus à l'étape de saisie). Vérifiez leur statut de synchronisation dans la liste des enregistrements",
      mergeWithSameKeysNotAllowedNote:
        "Certains enregistrements ont la ou les mêmes clés qu'un enregistrement déjà présent sur le serveur, et leur fusion n'est pas autorisée pour cette enquête. S'il s'agit d'enregistrements différents, modifiez leurs valeurs clés ; s'il s'agit du même enregistrement, contactez l'administrateur de l'enquête.",
      syncingTooltip: "Synchronisation des enregistrements...",
      progressPercent: "{{progressPercent}} %",
      uncheckedTooltip:
        "État de synchronisation non encore vérifié. Utilisez « Vérifier synchronisation » pour le vérifier",
      offlineTooltip:
        "Aucune connexion internet. La synchronisation automatique reprendra une fois la connexion rétablie",
      authErrorTooltip:
        "Votre session avec le serveur a expiré. Reconnectez-vous pour reprendre la synchronisation automatique",
      checkErrorTooltip:
        "Impossible de vérifier l'état de synchronisation en raison d'une erreur serveur. Réessayez",
      noCandidatesMessage: "Rien à envoyer pour le moment",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Les nœuds ne s'appliqueront plus",
    message: `Les nœuds suivants ne s'appliqueront plus :  
  
{{attributeNames}}  
  
Leurs valeurs seront effacées.  
Continuer ?`,
  },
  confirmGoToListOfRecords:
    "Aller à la liste des enregistrements?\n\n(toutes les modifications sont déjà enregistrées)",
  checkStatus: "Vérifier synchronisation",
  closestSamplingPoint: {
    findClosestSamplingPoint:
      "Trouver le point d'échantillonnage le plus proche",
    findingClosestSamplingPoint:
      "Recherche du point d'échantillonnage le plus proche",
    minDistanceItemFound: "Élément trouvé à une distance de {{minDistance}}m",
    minDistanceItemFound_other:
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
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Si vous continuez, certaines entités énumérées dépendantes ({{entityDefs}}) seront ré-énumérées, supprimant les valeurs existantes qui y ont été insérées (le cas échéant).\n\nMettre à jour les entités énumérées ?",
    title: "Mettre à jour les entités énumérées",
  },
  createRecordError:
    "Erreur lors de la création d'un nouvel enregistrement : {{error}}",
  userGroupNotReady: {
    title: "Informations utilisateur non prêtes",
    message: `Les informations de votre groupe d'utilisateurs n'ont pas encore été récupérées depuis le serveur. Cette enquête comporte des attributs pré-remplis en fonction de votre groupe d'utilisateurs. Créer l'enregistrement maintenant pourrait donc les laisser vides ou incorrects.

Voulez-vous les récupérer à nouveau depuis le serveur ?`,
    fetchAgain: "Récupérer à nouveau",
    stillNotReady:
      "Impossible de récupérer les informations de votre groupe d'utilisateurs depuis le serveur. Enregistrement non créé.",
  },
  updateAttributeError:
    "Erreur lors de la mise à jour de la valeur : {{error}}",
  cycle: "Cycle",
  cycleForNewRecords: "Cycle pour les nouveaux enregistrements:",
  options: "Options",
  editNodeDef: "Modifier {{nodeDef}}",
  viewNodeDef: "Voir {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Erreur lors de la récupération des enregistrements depuis le serveur.\n\nVérifier les paramètres de connexion.\n\nDétails: {{details}}",
  errorGeneratingRecordsExportFile:
    "Erreur lors de la génération du fichier d'exportation des enregistrements: {{details}}",
  errorLoadingRecords:
    "Erreur lors du chargement des enregistrements: {{details}}",
  exportNewOrUpdatedRecords:
    "Exporter les nouveaux enregistrements ou les enregistrements mis à jour",
  formLanguage: "Langue du formulaire:",
  entityListColumns: {
    button: "Colonnes",
    hideAll: "Tout masquer",
    keys: "Attributs clés",
    other: "Autres attributs",
    reset: "Par défaut",
    showAll: "Tout afficher",
    summary: "Attributs de résumé",
    title: "Colonnes visibles",
  },
  noEntitiesDefined: "Aucune entité définie",
  goToDataEntry: "Aller à la saisie de données",
  goToListOfRecords: "Liste des enregistrements",
  gpsLockingEnabledWarning: "Avertissement: Verrouillage GPS activé!",
  listOfRecords: "Enregistrements",
  localBackup: "Sauvegarde locale",
  newRecord: "Nouvel enregistrement",
  newRecordShort: "Nouveau",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Impossible d'ajouter plus d'éléments : nombre maximum atteint",
    },
    cannotDeleteNode: {
      noNodeFound: "Impossible de supprimer le nœud : aucun nœud trouvé",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Impossible de mettre à jour la valeur : aucun nœud trouvé",
    },
  },
  noRecordsFound: "Aucun enregistrement trouvé",
  recordEditor: "Éditeur d'enregistrements",
  recordCompletion: {
    shortDescription: "{{percent}} % terminé",
  },
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
  recordStatus: {
    new: "nouveau",
    updated: "mis à jour",
    conflicting: "conflictuel",
    conflictingModifiedRemotely: "modifié sur l'appareil et sur le serveur",
    withValidationErrors: "avec des erreurs de validation",
  },
  sendData: "Envoyer données",
  showOnlyLocalRecords: "Afficher uniquement les enregistrements locaux",
  syncedOn: "Synchronisé le",
  syncStatusHeader: "État",
  syncStatus: {
    conflictingKeys: "Un enregistrement avec la/les même(s) clé(s) existe déjà",
    deviceDateBehindServer:
      "Non téléversé: la date de l'appareil est antérieure à celle du serveur (réglez la date et l'heure correctes, puis modifiez à nouveau l'enregistrement)",
    keysNotSpecified: "Clé(s) non spécifiée(s)",
    new: "Nouveau (pas encore téléchargé)",
    notModified: "Non modifié (aucune modification à télécharger)",
    modifiedLocally: "Modifié localement",
    modifiedLocallyAndRemotely:
      "Modifié localement et sur le serveur distant (conflit)",
    modifiedRemotely: "Modifié sur le serveur distant",
    notInEntryStepAnymore:
      "Plus à l'étape de saisie (à l'étape de nettoyage ou d'analyse)",
  },
  processingData: {
    title: "Traitement des données",
  },
  uploadingData: {
    title: "Téléchargement des données",
    size: "Taille du fichier: {{size}}",
    speed: "Vitesse de téléversement: {{speed}}/s",
    eta: "Temps restant estimé: {{eta}}",
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
    selectItem_other: "Sélectionner des éléments",
  },
  coordinate: {
    longPressMarkerToMove:
      "Appuyez longuement sur le marqueur pour le déplacer",
    saveNewPosition: "Enregistrer la nouvelle position",
    accuracy: "Précision (m)",
    altitude: "Altitude (m)",
    altitudeAccuracy: "Précision de l'altitude (m)",
    angleToTargetLocation: "Angle par rapport à la cible",
    confirmConvertCoordinate:
      "Convertir la coordonnée du SRS {{srsFrom}} vers le SRS {{srsTo}}?",
    connectingToSource: "Connexion à {{label}}...",
    convert: "Convertir",
    currentLocation: "Position actuelle",
    distance: "Distance (m)",
    externalGpsGenericLabel: "appareil GPS externe",
    getLocation: "Obtenir la position",
    heading: "Cap (deg)",
    map: {
      attributeViewerTitle: "Position de « {{attributeLabel}} »",
      chooserTitle: "Afficher sur la carte",
      inApp: "Arena Mobile",
      inAppDescription: "Fonctionne hors ligne avec les cartes téléchargées",
      inAppDescriptionRelocatable:
        "Fonctionne hors ligne avec les cartes téléchargées.\nLa position peut être déplacée",
      otherApp: "Autre application…",
      otherAppDescription:
        "Choisir parmi toutes les applications installées pouvant afficher un emplacement",
      show: "Afficher",
      targetViewerTitle: "Position cible de « {{attributeLabel}} »",
      viewerTitle: "Position",
    },
    headingOffset: "Décalage de cap",
    headingSource: "Source du cap",
    headingSourceMagnetometer: "Capteur",
    headingSourceLocation: "GPS",
    keepXAndY: "Conserver X et Y",
    locationCannotBeConvertedToSrs:
      "La position GPS ne peut pas être convertie dans le système de coordonnées {{srs}}",
    locationHeadingNotAvailable: "Cap GPS non disponible !",
    magnetometerNotAvailable: "Magnétomètre non disponible!",
    navigateToTarget: "Naviguer vers la cible",
    srs: "$t(common:srs)",
    targetLocation: "Position cible",
    useCurrentLocation: "Utiliser la position actuelle",
    usingInternalFallback:
      "Utilisation du GPS interne ({{label}} indisponible)",
    usingSource: "Utilisation de {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Boussole",
    viewModeRadar: "Radar",
    locationNavigatorInfo: {
      title: "Navigateur de position",
      description:
        "Vous guide vers une coordonnée cible à l'aide du GPS et des capteurs de votre appareil. Il affiche la position cible par rapport à votre position actuelle et vous permet de vous y rendre sur le terrain.",
      viewModesTitle: "Modes d'affichage",
      compassTitle: "Boussole",
      compassDesc:
        "Affiche une rose des vents rotative orientée vers le nord. Une flèche pointe vers la cible. Lorsque vous êtes très proche de la cible (mode proximité), la flèche est remplacée par un point sur le cercle de précision indiquant la position relative de la cible.",
      radarTitle: "Radar",
      radarDesc:
        "Affiche une vue radar de dessus avec votre position fixée au centre. Le point cible se déplace autour de vous en temps réel pour refléter sa direction et sa distance réelles.",
      headingSourcesTitle: "Sources du cap",
      sensorTitle: "Capteur (magnétomètre)",
      sensorDesc:
        "Utilise le magnétomètre intégré de l'appareil (puce boussole). Fonctionne à l'arrêt, mais peut être perturbé par des objets métalliques à proximité ou des interférences magnétiques.",
      gpsTitle: "GPS",
      gpsDesc:
        "Détermine le cap à partir du déplacement GPS. Plus précis en terrain dégagé, mais nécessite que vous marchiez et peut ne pas être disponible sur tous les appareils.",
    },
  },
  geo: {
    drawPolygon: "Dessiner un polygone",
    editPolygon: "Modifier le polygone",
    selectPolygonInstruction: "Appuyez sur un polygone pour le sélectionner",
    selectPointInstructions: `- Touchez un point pour le sélectionner.  
- Touchez un point médian pour ajouter un nouveau point.`,
    editPolygonInstructions:
      "Appuyez longuement sur le point sélectionné et faites-le glisser pour le déplacer.",
    tapToAddPoints: `Touchez la carte pour ajouter des points.  
Appuyez sur '$t(common:stop)' lorsque c'est fait.`,
    deleteSelectedPoint: "Supprimer le point sélectionné",
    addCurrentLocationPoint: "Ajouter la position actuelle",
    addCurrentLocationPointInstructions:
      "Appuyez sur '$t(dataEntry:geo.addCurrentLocationPoint)' pour ajouter la position actuelle au polygone",
  },
  positionTracking: {
    title: "Suivi de position",
    start: "Démarrer le suivi",
    resume: "Reprendre",
    restart: "Recommencer",
    restartConfirm: {
      title: "Supprimer le tracé enregistré?",
      message:
        "Tous les points enregistrés jusqu'à présent dans cet attribut seront supprimés et le suivi recommencera depuis le début. Cette action est irréversible.",
    },
    delete: "Supprimer le tracé",
    deleteConfirm: {
      title: "Supprimer le tracé enregistré?",
      message:
        "Tous les points enregistrés dans cet attribut seront supprimés et l'attribut restera vide. Cette action est irréversible.",
    },
    stop: "Arrêter",
    showTrack: "Afficher le tracé",
    retry: "Réessayer",
    status: {
      idle: "Pas de suivi",
      stopped: "Suivi arrêté",
      starting: "Démarrage du suivi…",
      tracking: "Suivi en cours",
      paused: "Suivi en pause",
    },
    waitingForFix: "En attente du GPS…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "{{count}} points",
    trackSummary: "{{length}} · {{pointsCount}} points · {{duration}}",
    attributeNotEditable:
      "La valeur de cet attribut est enregistrée par le suivi de position",
    stopConfirm:
      "Arrêter le suivi? Le tracé enregistré est sauvegardé dans l'attribut et pourra être poursuivi plus tard.",
    stopCurrentConfirm:
      "Un autre attribut est en cours de suivi: arrêter son suivi et démarrer le suivi de celui-ci?",
    interrupted:
      "Le suivi de position a été interrompu: le tracé enregistré a été sauvegardé. Reprenez le suivi pour continuer.",
    error: {
      generic: "Impossible de démarrer le suivi de position",
      permissionDenied:
        "Impossible de suivre la position: accès à la localisation non accordé",
      locationServicesOff:
        "Impossible de suivre la position: les services de localisation sont désactivés",
      notSaved:
        "Le tracé n'a pas encore pu être sauvegardé dans l'attribut: il le sera plus tard",
    },
  },
  taxon: {
    search: "Rechercher un taxon",
    taxonNotSelected: "--- Taxon non sélectionné ---",
  },
  fileAttribute: {
    selectAudio: "Sélectionner audio",
    selectFile: "Sélectionner fichier",
    selectPicture: "Sélectionner image",
    selectVideo: "Sélectionner vidéo",
    deleteConfirmMessage: "Supprimer le fichier existant?",
    fileMissing: "Fichier introuvable dans le stockage local",
    fileSelectError: "Erreur lors de la sélection du fichier : {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording:
        "Erreur au démarrage de l'enregistrement audio : {{error}}",
      pausingRecording:
        "Erreur lors de la pause de l'enregistrement audio : {{error}}",
      resumingRecording:
        "Erreur lors de la reprise de l'enregistrement audio : {{error}}",
      savingRecording: "Erreur lors de l'enregistrement du fichier audio",
      stoppingRecording:
        "Erreur à l'arrêt de l'enregistrement audio : {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Aperçu de l'image",
    pictureResizedToSize: `Image redimensionnée à {{size}}.
Taille maximale autorisée : {{maxSizeMB}} Mo.
Vérifiez les paramètres ou demandez à l'administrateur de l'enquête de modifier cette limite.`,
    resolution: "Résolution",
    rotate: "Pivoter",
    cameraOpenError: "Erreur lors de l'ouverture de la caméra : {{error}}",
    rotationError: "Erreur lors de la rotation de l'image : {{error}}",
  },
  dataExport: {
    confirm: {
      title: "Confirmer l'exportation des données",
      message: `Enregistrements à exporter:
{{recordsCountSummary}}`,
      selectOptions: `Sélectionner les options d'exportation:`,
    },

    error: "Erreur lors de l'exportation des données. Détails: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Données exportées avec succès, mais {{missingFiles}} fichiers/images sont manquants ou corrompus. Veuillez vérifier vos enregistrements et également les enregistrements sur le serveur.",
    exportingData: "Exportation des données...",
    uploadBatch: "Partie {{batch}} sur {{batchCount}}",
    exportToCsv: "Exporter en CSV",
    mergeConflictingRecords: "Fusionner les enregistrements conflictuels",
    mergeWithSameKeysNotAllowed:
      "La fusion d'enregistrements ayant la ou les mêmes clés n'est pas autorisée pour cette enquête : les enregistrements aux clés conflictuelles ne seront donc pas envoyés. S'il s'agit d'enregistrements différents, modifiez leurs valeurs clés ; s'il s'agit du même enregistrement, contactez l'administrateur de l'enquête.",
    mergeSameRecordConflictConfirm: {
      title: "Fusionner les enregistrements modifiés sur les deux appareils",
      message: `{{count}} enregistrement(s) ont également été modifiés sur le serveur depuis la dernière synchronisation de cet appareil.

La fusion combinera vos modifications avec celles du serveur : pour chaque champ, la valeur modifiée le plus récemment sera conservée, et toute nouvelle section ajoutée sur l'un ou l'autre appareil sera conservée.

Cela ne peut pas être prévisualisé au préalable. Balayez pour confirmer et continuer.`,
    },
    noRecordsInDeviceToExport: "Aucun enregistrement à exporter sur l'appareil",
    onlyNewOrUpdatedRecords:
      "Exporter uniquement les enregistrements nouveaux ou mis à jour",
    recordsMergedMessage: `Les enregistrements suivants ont été fusionnés avec la version plus récente déjà présente sur le serveur :
{{recordsList}}

La version fusionnée de ces enregistrements a été récupérée automatiquement.`,
    onlyRecordsInRemoteServerCanBeImported:
      "Seuls les enregistrements déjà présents sur le serveur distant ou les enregistrements qui ont été mis à jour à distance peuvent être importés",
    option: {
      [FlatDataExportOption.addCycle]: "Ajouter le cycle",
      [FlatDataExportOption.includeAncestorAttributes]: "Attributs ancêtres",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Étiquettes des éléments de catégorie",
      [FlatDataExportOption.includeFiles]: "Attributs de fichier",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Nom scientifique du taxon",
    },
    selectTarget: "Sélectionner la cible d'exportation",
    selectTargetMessage: "Sélectionner la cible de l'exportation:",
    shareExportedFile: "Partager le fichier exporté",
    target: {
      remote: "Serveur distant",
      local: "Dossier local (Téléchargement)",
      share: "$t(common:shareFile)",
    },
    recordsWithMissingFilesConfirm: {
      confirmButton: "Exporter sans fichiers manquants",
      title: "Fichiers manquants",
      message: `Les enregistrements suivants ont des fichiers manquants et seront exportés sans eux:\n{{recordsList}}\n\nVoulez-vous continuer quand même?`,
    },
    title: "Exporter les données",
  },
  location: {
    label: "Emplacement",
    gettingCurrentLocation: "Obtention de l'emplacement actuel",
    usingCurrentLocation: "Utilisation de l'emplacement actuel",
  },
  unlock: {
    label: "Déverrouiller",
    confirmMessage:
      "La modification de l'enregistrement est verrouillée; la déverrouiller?",
    confirmTitle: "Modification verrouillée",
  },
};
