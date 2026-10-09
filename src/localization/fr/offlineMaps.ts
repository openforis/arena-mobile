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
  customLayers: {
    title: "Couches de carte personnalisées",
    description:
      "Ajoutez des couches de carte d'autres fournisseurs de tuiles (tuiles raster XYZ), avec une clé API si le fournisseur l'exige. Elles peuvent être sélectionnées comme couche de carte par défaut dans les paramètres et avec le bouton des couches sur la carte. Assurez-vous que les conditions d'utilisation du fournisseur le permettent.",
    add: "Ajouter une couche",
    noLayers: "Aucune couche de carte personnalisée définie",
    maxZoom: "Zoom max : {{value}}",
    deleteConfirm:
      "Supprimer la couche de carte personnalisée '{{name}}' et ses tuiles stockées sur cet appareil ?",
    editor: {
      title: "Couche de carte personnalisée",
      name: "Nom",
      url: "Modèle d'URL",
      urlHint:
        "Exemple : https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} et {z} sont obligatoires ; {apiKey} est remplacé par la clé API.",
      apiKey: "Clé API (facultative)",
      apiKeyHint:
        "Enregistrée dans le stockage sécurisé de l'appareil et utilisée uniquement dans les requêtes au fournisseur de tuiles.",
      attribution: "Attribution (facultative)",
      attributionHint:
        "Mention de droits d'auteur exigée par le fournisseur ; elle est affichée sur la carte.",
      test: {
        label: "Tester",
        success: "Tuile de carte téléchargée avec succès",
        errorStatus:
          "Le fournisseur de tuiles n'a pas renvoyé de tuile de carte (statut HTTP : {{status}}) ; vérifiez le modèle d'URL et la clé API",
        errorNotReachable:
          "Le fournisseur de tuiles est injoignable ; vérifiez le modèle d'URL et la connexion internet",
      },
    },
    validation: {
      nameRequired: "Le nom est obligatoire",
      nameDuplicate: "Nom déjà utilisé par une autre couche",
      urlRequired: "Le modèle d'URL est obligatoire",
      urlNotHttps: "Le modèle d'URL doit commencer par https://",
      urlPlaceholdersMissing:
        "Le modèle d'URL doit contenir les paramètres {x}, {y} et {z}",
      urlSubdomainNotSupported:
        "Le paramètre {s} n'est pas pris en charge : remplacez-le par l'un des sous-domaines du fournisseur (par ex. 'a')",
      apiKeyRequired:
        "Le modèle d'URL contient {apiKey} : la clé API est obligatoire",
      apiKeyPlaceholderMissing:
        "Ajoutez le paramètre {apiKey} au modèle d'URL, à l'endroit où la clé API est attendue",
    },
  },
  mapTypes: {
    standard: "Standard",
    satellite: "Satellite",
    hybrid: "Hybride",
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
    lowSpaceConfirm: {
      title: "Espace libre limité",
      message:
        "Le téléchargement utilisera environ {{size}}, soit {{percent}} % de l'espace libre sur l'appareil ({{freeSpace}}). Continuer ?",
    },
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
