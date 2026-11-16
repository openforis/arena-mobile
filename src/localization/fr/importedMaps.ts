export default {
  title: "Cartes importées",
  description:
    "Importez des cartes à partir de fichiers PDF ou GeoTIFF géospatiaux (géoréférencés) enregistrés sur cet appareil : elles s'affichent au-dessus du fond de carte dans toutes les cartes de l'application, même sans connexion internet.",
  rendererNotAvailable:
    "Les cartes importées ne sont pas prises en charge par cette version de l'application : mettez-la à jour vers la dernière version",
  importMap: "Importer une carte",
  noMaps: "Aucune carte importée pour le moment",
  storage: {
    used: "Espace utilisé par les cartes importées :",
  },
  opacity: "Opacité : {{value}} %",
  hideBaseMap: "Carte importée seule",
  map: {
    fileName: "Fichier : {{fileName}}",
    page: "Page : {{page}}",
    zoomLevels: "Niveaux de zoom : {{minZoom}} - {{maxZoom}}",
    tiles: "Tuiles : {{count}}",
    size: "Taille : {{size}} (fichier PDF : {{sourceSize}})",
    sizeTilesOnly: "Taille : {{size}}",
    datumWarning:
      "Le datum de la carte n'est pas WGS84 : la carte pourrait être décalée de quelques mètres",
    visible: "Afficher sur les cartes",
    deleteConfirm: "Supprimer la carte '{{name}}' ?",
    notFound: "Carte introuvable",
    viewerTitle: "Carte importée",
  },
  import: {
    title: "Importer une carte",
    analyzing: "Lecture du géoréférencement du fichier...",
    errorReading: "Erreur lors de la lecture du fichier : {{details}}",
    notGeoreferenced:
      "Le fichier n'est pas géoréférencé : il ne contient pas les coordonnées géographiques de la carte",
    unsupportedGeoreference:
      "Le géoréférencement de ce fichier PDF (encodage OGC GeoPDF) n'est pas encore pris en charge",
    unsupportedFile: "Le fichier n'est ni un PDF ni un GeoTIFF",
    unsupportedGeoTiffFormat:
      "Les images de ce fichier GeoTIFF ne sont pas prises en charge ({{details}}) : seules les images à 8 bits par échantillon (RVB, RVBA, niveaux de gris ou avec une palette de couleurs) peuvent être importées",
    page: "Page",
    pageItem: "Page {{page}}",
    name: "Nom",
    maxZoom: "Zoom max : {{value}}",
    nativeZoom: "(résolution de la carte : {{value}})",
    maxZoomAboveNative:
      "Les niveaux de zoom supérieurs à la résolution de la carte seront flous",
    estimate: "{{tiles}} tuiles · ~{{size}} (espace libre : {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} tuiles : trop nombreuses (max {{maxTiles}}) ; réduisez le zoom max",
    tooManyTiles:
      "Trop de tuiles : {{maxTiles}} tuiles au maximum peuvent être générées ; réduisez le zoom max",
    notEnoughSpace: "Espace libre insuffisant sur l'appareil",
    lowSpaceConfirm: {
      title: "Espace libre faible",
      message:
        "La carte occupera environ {{size}}, soit {{percent}} % de l'espace libre de l'appareil ({{freeSpace}}). Continuer ?",
    },
    preview: {
      rendering: "Génération de l'aperçu...",
      lowResolution:
        "Aperçu en basse résolution (niveaux de zoom {{minZoom}} - {{maxZoom}})",
      error: "Aperçu non disponible : {{details}}",
    },
    importButton: "Importer",
    jobTitle: "Importation de la carte",
    complete: "Carte importée ({{size}})",
    error: "Erreur lors de l'importation de la carte : {{details}}",
  },
  validation: {
    nameRequired: "Le nom est obligatoire",
    nameDuplicate: "Nom déjà utilisé par une autre carte importée",
  },
};
