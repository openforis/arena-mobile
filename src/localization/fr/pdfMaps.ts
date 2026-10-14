export default {
  title: "Cartes PDF",
  description:
    "Importez des cartes à partir de fichiers PDF géospatiaux (géoréférencés) enregistrés sur cet appareil : elles s'affichent au-dessus du fond de carte dans toutes les cartes de l'application, même sans connexion internet.",
  rendererNotAvailable:
    "Les cartes PDF ne sont pas prises en charge par cette version de l'application : mettez-la à jour vers la dernière version",
  importPdf: "Importer un PDF",
  noMaps: "Aucune carte PDF importée pour le moment",
  storage: {
    used: "Espace utilisé par les cartes PDF :",
  },
  opacity: "Opacité : {{value}} %",
  hideBaseMap: "PDF seul",
  map: {
    fileName: "Fichier : {{fileName}}",
    page: "Page : {{page}}",
    zoomLevels: "Niveaux de zoom : {{minZoom}} - {{maxZoom}}",
    tiles: "Tuiles : {{count}}",
    size: "Taille : {{size}} (fichier PDF : {{sourceSize}})",
    datumWarning:
      "Le datum de la carte n'est pas WGS84 : la carte pourrait être décalée de quelques mètres",
    visible: "Afficher sur les cartes",
    deleteConfirm: "Supprimer la carte PDF '{{name}}' ?",
    notFound: "Carte PDF introuvable",
    viewerTitle: "Carte PDF",
  },
  import: {
    title: "Importer une carte PDF",
    analyzing: "Lecture du géoréférencement du fichier PDF...",
    errorReading: "Erreur lors de la lecture du fichier PDF : {{details}}",
    notGeoreferenced:
      "Le fichier PDF n'est pas géoréférencé : il ne contient pas les coordonnées géographiques de la carte",
    unsupportedGeoreference:
      "Le géoréférencement de ce fichier PDF (encodage OGC GeoPDF) n'est pas encore pris en charge",
    page: "Page",
    pageItem: "Page {{page}}",
    name: "Nom",
    maxZoom: "Zoom max : {{value}}",
    nativeZoom: "(résolution du PDF : {{value}})",
    maxZoomAboveNative:
      "Les niveaux de zoom supérieurs à la résolution du PDF seront flous",
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
    jobTitle: "Importation de la carte PDF",
    complete: "Carte PDF importée ({{size}})",
    error: "Erreur lors de l'importation de la carte PDF : {{details}}",
  },
  validation: {
    nameRequired: "Le nom est obligatoire",
    nameDuplicate: "Nom déjà utilisé par une autre carte PDF",
  },
};
