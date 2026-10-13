export default {
  title: "PDF maps",
  description:
    "Import maps from geospatial (georeferenced) PDF files stored on this device: they are shown on top of the base map in all the maps of the app, even without an internet connection.",
  rendererNotAvailable:
    "PDF maps are not supported by this version of the app: update it to the latest version",
  importPdf: "Import PDF",
  noMaps: "No PDF maps imported yet",
  storage: {
    used: "Space used by PDF maps:",
  },
  opacity: "Opacity: {{value}}%",
  map: {
    fileName: "File: {{fileName}}",
    page: "Page: {{page}}",
    zoomLevels: "Zoom levels: {{minZoom}} - {{maxZoom}}",
    tiles: "Tiles: {{count}}",
    size: "Size: {{size}} (PDF file: {{sourceSize}})",
    datumWarning:
      "The datum of the map is not WGS84: the map could be shifted by some meters",
    visible: "Show on maps",
    deleteConfirm: "Delete the PDF map '{{name}}'?",
    notFound: "PDF map not found",
    viewerTitle: "PDF map",
  },
  import: {
    title: "Import PDF map",
    analyzing: "Reading the georeferencing of the PDF file...",
    errorReading: "Error reading the PDF file: {{details}}",
    notGeoreferenced:
      "The PDF file is not georeferenced: it doesn't contain the geographic coordinates of the map",
    unsupportedGeoreference:
      "The georeferencing of this PDF file (OGC GeoPDF encoding) is not supported yet",
    page: "Page",
    pageItem: "Page {{page}}",
    name: "Name",
    maxZoom: "Max zoom: {{value}}",
    nativeZoom: "(PDF resolution: {{value}})",
    maxZoomAboveNative:
      "Zoom levels above the resolution of the PDF will look blurred",
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
    importButton: "Import",
    jobTitle: "Importing PDF map",
    complete: "PDF map imported ({{size}})",
    error: "Error importing the PDF map: {{details}}",
  },
  validation: {
    nameRequired: "Name is required",
    nameDuplicate: "Name already in use by another PDF map",
  },
};
