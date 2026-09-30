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
  noAreas: "No offline map areas downloaded yet",
  storage: {
    used: "Space used by map tiles:",
    free: "Free space on device:",
  },
  layers: {
    esriWorldImagery: "Satellite (Esri World Imagery)",
    openTopoMap: "Topographic (OpenTopoMap)",
    openStreetMap: "Standard (OpenStreetMap, online only)",
  },
  area: {
    layer: "Layer: {{layer}}",
    zoomLevels: "Zoom levels: {{minZoom}} - {{maxZoom}}",
    tiles: "Tiles: {{downloaded}} / {{total}}",
    size: "Size: {{size}}",
    lastUpdate: "Last update: {{date}}",
    missingTiles: "{{count}} tiles missing",
    resumeDownload: "Download missing",
    deleteConfirm: "Delete the offline map area '{{name}}'?",
  },
  areaEditor: {
    title: "New offline map area",
    name: "Name",
    maxZoom: "Max zoom: {{value}}",
    drawAreaToEstimate:
      "Draw the area of interest on the map to see the space it will occupy",
    estimate: "{{tiles}} tiles · ~{{size}} (free space: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} tiles: too many (max {{maxTiles}}); reduce the area or the max zoom",
    tooManyTiles:
      "The area is too big: max {{maxTiles}} tiles can be downloaded; reduce the area or the max zoom",
    notEnoughSpace: "Not enough free space on the device",
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
