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
