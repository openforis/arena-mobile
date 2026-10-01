export default {
  title: "Cartes hors ligne",
  description:
    "Téléchargez la carte de votre zone d'intérêt avant d'aller sur le terrain : elle sera disponible même sans connexion internet lors du dessin ou de l'affichage des attributs géographiques.",
  freeLayersNotInUse:
    "Les cartes hors ligne ne sont utilisées que lorsque le fournisseur de cartes dans les paramètres est 'Free map layers'.",
  useFreeLayers: "Utiliser les couches de carte gratuites",
  offlineMode: "Hors ligne",
  addArea: "Ajouter une zone",
  deleteAll: "Tout supprimer",
  deleteAllConfirm:
    "Supprimer toutes les zones de carte hors ligne et toutes les tuiles de carte stockées sur cet appareil ?",
  clearCache: "Vider le cache des cartes",
  clearCacheConfirm:
    "Supprimer toutes les tuiles de carte stockées sur cet appareil (tuiles mises en cache lors de la navigation sur les cartes) ?",
  noAreas: "Aucune zone de carte hors ligne téléchargée pour le moment",
  storage: {
    used: "Espace utilisé par les tuiles de carte (zones téléchargées et cache) :",
    free: "Espace libre sur l'appareil :",
  },
  layers: {
    esriWorldImagery: "Satellite (Esri World Imagery)",
    openTopoMap: "Topographique (OpenTopoMap)",
    openStreetMap: "Standard (OpenStreetMap, en ligne uniquement)",
  },
  area: {
    surface: "Superficie : {{area}}",
    layer: "Couche : {{layer}}",
    zoomLevels: "Niveaux de zoom : {{minZoom}} - {{maxZoom}}",
    tiles: "Tuiles : {{downloaded}} / {{total}}",
    size: "Taille : {{size}}",
    lastUpdate: "Dernière mise à jour : {{date}}",
    missingTiles: "Tuiles manquantes : {{count}}",
    resumeDownload: "Télécharger les manquantes",
    deleteConfirm: "Supprimer la zone de carte hors ligne '{{name}}' ?",
    nameRequired: "Le nom est obligatoire",
    nameDuplicate: "Nom déjà utilisé par une autre zone",
  },
  areaEditor: {
    title: "Nouvelle zone de carte hors ligne",
    name: "Nom",
    layer: "Couche",
    maxZoom: "Zoom max : {{value}}",
    currentZoom: "Zoom actuel : {{value}}",
    surface: "Superficie : {{area}}",
    drawAreaToEstimate:
      "Dessinez la zone d'intérêt sur la carte pour voir l'espace qu'elle occupera",
    estimate: "{{tiles}} tuiles · ~{{size}} (espace libre : {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} tuiles : trop nombreuses (max {{maxTiles}}) ; réduisez la zone ou le zoom max",
    tooManyTiles:
      "La zone est trop grande : {{maxTiles}} tuiles au maximum peuvent être téléchargées ; réduisez la zone ou le zoom max",
    notEnoughSpace: "Espace libre insuffisant sur l'appareil",
  },
  areaViewer: {
    title: "Zone de carte hors ligne",
    notFound: "Zone de carte hors ligne introuvable",
  },
  download: {
    label: "Télécharger",
    title: "Téléchargement des tuiles de carte",
    complete: "Zone de carte hors ligne téléchargée ({{size}})",
    completeWithMissingTiles:
      "Zone de carte hors ligne téléchargée ({{size}}) ; {{missingTiles}} tuiles n'ont pas pu être téléchargées",
    error:
      "Erreur lors du téléchargement de la zone de carte hors ligne : {{details}}",
  },
};
