export default {
  title: "Imported maps",
  description:
    "Import maps from geospatial (georeferenced) PDF or GeoTIFF files stored on this device: they are shown on top of the base map in all the maps of the app, even without an internet connection.",
  rendererNotAvailable:
    "Imported maps are not supported by this version of the app: update it to the latest version",
  importMap: "Import map",
  noMaps: "No maps imported yet",
  storage: {
    used: "Space used by imported maps:",
  },
  opacity: "Opacity: {{value}}%",
  hideBaseMap: "Only imported map",
  map: {
    fileName: "File: {{fileName}}",
    page: "Page: {{page}}",
    zoomLevels: "Zoom levels: {{minZoom}} - {{maxZoom}}",
    tiles: "Tiles: {{count}}",
    size: "Size: {{size}} (PDF file: {{sourceSize}})",
    sizeTilesOnly: "Size: {{size}}",
    datumWarning:
      "The datum of the map is not WGS84: the map could be shifted by some meters",
    visible: "Show on maps",
    deleteConfirm: "Delete the map '{{name}}'?",
    notFound: "Map not found",
    viewerTitle: "Imported map",
  },
  import: {
    title: "Import map",
    analyzing: "Reading the georeferencing of the file...",
    errorReading: "Error reading the file: {{details}}",
    notGeoreferenced:
      "The file is not georeferenced: it doesn't contain the geographic coordinates of the map",
    unsupportedGeoreference:
      "The georeferencing of this PDF file (OGC GeoPDF encoding) is not supported yet",
    unsupportedFile: "The file is not a PDF or a GeoTIFF",
    unsupportedGeoTiffFormat:
      "The images of this GeoTIFF file are not supported ({{details}}): only images with 8 bits per sample (RGB, RGBA, grayscale or with a color palette) can be imported",
    page: "Page",
    pageItem: "Page {{page}}",
    name: "Name",
    maxZoom: "Max zoom: {{value}}",
    nativeZoom: "(map resolution: {{value}})",
    maxZoomAboveNative:
      "Zoom levels above the resolution of the map will look blurred",
    estimate: "{{tiles}} tiles · ~{{size}} (free space: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} tiles: too many (max {{maxTiles}}); reduce the max zoom",
    tooManyTiles:
      "Too many tiles: max {{maxTiles}} tiles can be generated; reduce the max zoom",
    notEnoughSpace: "Not enough free space on the device",
    lowSpaceConfirm: {
      title: "Low free space",
      message:
        "The map will use about {{size}}, {{percent}}% of the free space on the device ({{freeSpace}}). Continue?",
    },
    preview: {
      rendering: "Rendering the preview...",
      lowResolution:
        "Preview at low resolution (zoom levels {{minZoom}} - {{maxZoom}})",
      error: "Preview not available: {{details}}",
    },
    importButton: "Import",
    jobTitle: "Importing the map",
    complete: "Map imported ({{size}})",
    error: "Error importing the map: {{details}}",
  },
  validation: {
    nameRequired: "Name is required",
    nameDuplicate: "Name already in use by another imported map",
  },
};
