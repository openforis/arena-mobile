export default {
  title: "Offline maps",
  description:
    "Download the map of your area of interest before going to the field: it will be available even without an internet connection when drawing or viewing geographic attributes.",
  freeLayersNotInUse:
    "Offline maps are used only when the map provider in the settings is set to 'Free map layers'.",
  useFreeLayers: "Use free map layers",
  offlineMode: "Offline",
  addArea: "Add area",
  deleteAll: "Delete all",
  deleteAllConfirm:
    "Delete all the offline map areas and all the map tiles stored on this device?",
  clearCache: "Clear map cache",
  clearCacheConfirm:
    "Delete all the map tiles stored on this device (tiles cached while browsing the maps)?",
  noAreas: "No offline map areas downloaded yet",
  storage: {
    used: "Space used by map tiles (downloaded areas and cache):",
    free: "Free space on device:",
  },
  layers: {
    esriWorldImagery: "Satellite (Esri World Imagery)",
    openTopoMap: "Topographic (OpenTopoMap)",
    openStreetMap: "Standard (OpenStreetMap, online only)",
  },
  customLayers: {
    title: "Custom map layers",
    description:
      "Add map layers from other tile providers (XYZ raster tiles), with an API key if the provider requires it. They can be selected as default map layer in the settings and with the layers button on the map. Make sure the terms of use of the provider allow it.",
    add: "Add layer",
    noLayers: "No custom map layers defined yet",
    maxZoom: "Max zoom: {{value}}",
    deleteConfirm:
      "Delete the custom map layer '{{name}}' and its map tiles stored on this device?",
    deleteConfirmWithOfflineAreas:
      "Delete the custom map layer '{{name}}', its map tiles stored on this device and the offline map areas downloaded with it ({{count}})?",
    editor: {
      title: "Custom map layer",
      name: "Name",
      url: "URL template",
      urlHint:
        "Example: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} and {z} are required; {apiKey} is replaced with the API key.",
      apiKey: "API key (optional)",
      apiKeyHint:
        "Stored in the secure storage of the device and used only in the requests to the tile provider.",
      attribution: "Attribution (optional)",
      attributionHint:
        "Copyright notice required by the provider; it is shown on the map.",
      urlChangeConfirm:
        "The URL template has changed: the map tiles of this layer stored on this device will be deleted and its offline map areas ({{count}}) will have to be downloaded again. Continue?",
      test: {
        label: "Test",
        success: "Map tile downloaded successfully",
        errorStatus:
          "The tile provider did not return a map tile (HTTP status: {{status}}); check the URL template and the API key",
        errorNotReachable:
          "The tile provider cannot be reached; check the URL template and the internet connection",
      },
    },
    validation: {
      nameRequired: "Name is required",
      nameDuplicate: "Name already in use by another layer",
      urlRequired: "URL template is required",
      urlNotHttps: "The URL template must start with https://",
      urlPlaceholdersMissing:
        "The URL template must contain the {x}, {y} and {z} placeholders",
      urlSubdomainNotSupported:
        "The {s} placeholder is not supported: replace it with one of the subdomains of the provider (e.g. 'a')",
      apiKeyRequired:
        "The URL template contains {apiKey}: the API key is required",
      apiKeyPlaceholderMissing:
        "Add the {apiKey} placeholder to the URL template, where the API key is expected",
    },
  },
  mapTypes: {
    standard: "Standard",
    satellite: "Satellite",
    hybrid: "Hybrid",
  },
  area: {
    surface: "Area: {{area}}",
    layer: "Layer: {{layer}}",
    zoomLevels: "Zoom levels: {{minZoom}} - {{maxZoom}}",
    tiles: "Tiles: {{downloaded}} / {{total}}",
    size: "Size: {{size}}",
    lastUpdate: "Last update: {{date}}",
    missingTiles: "Missing tiles: {{count}}",
    resumeDownload: "Download missing",
    deleteConfirm: "Delete the offline map area '{{name}}'?",
    nameRequired: "Name is required",
    nameDuplicate: "Name already in use by another area",
  },
  areaEditor: {
    title: "New offline map area",
    name: "Name",
    layer: "Layer",
    maxZoom: "Max zoom: {{value}}",
    currentZoom: "Current zoom: {{value}}",
    surface: "Area: {{area}}",
    drawAreaToEstimate:
      "Draw the area of interest on the map to see the space it will occupy",
    estimate: "{{tiles}} tiles · ~{{size}} (free space: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} tiles: too many (max {{maxTiles}}); reduce the area or the max zoom",
    tooManyTiles:
      "The area is too big: max {{maxTiles}} tiles can be downloaded; reduce the area or the max zoom",
    notEnoughSpace: "Not enough free space on the device",
    customLayerConfirm: {
      title: "Custom map layer",
      message:
        "About {{tiles}} map tiles will be downloaded from '{{layer}}'. Make sure the terms of use of the provider allow bulk downloads: they could be forbidden or charged. Continue?",
    },
    lowSpaceConfirm: {
      title: "Low free space",
      message:
        "The download will use about {{size}}, {{percent}}% of the free space on the device ({{freeSpace}}). Continue?",
    },
  },
  areaViewer: {
    title: "Offline map area",
    notFound: "Offline map area not found",
  },
  download: {
    label: "Download",
    title: "Downloading map tiles",
    complete: "Offline map area downloaded ({{size}})",
    completeWithMissingTiles:
      "Offline map area downloaded ({{size}}); {{missingTiles}} tiles could not be downloaded",
    error: "Error downloading the offline map area: {{details}}",
  },
};
