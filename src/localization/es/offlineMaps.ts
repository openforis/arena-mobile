export default {
  title: "Mapas sin conexión",
  description:
    "Descarga el mapa de tu área de interés antes de ir al campo: estará disponible incluso sin conexión a internet al dibujar o visualizar atributos geográficos.",
  freeLayersNotInUse:
    "Los mapas sin conexión se usan solo cuando el proveedor de mapas en la configuración es 'Free map layers'.",
  useFreeLayers: "Usar capas de mapa gratuitas",
  offlineMode: "Sin conexión",
  addArea: "Añadir área",
  deleteAll: "Eliminar todo",
  deleteAllConfirm:
    "¿Eliminar todas las áreas de mapas sin conexión y todas las teselas de mapa almacenadas en este dispositivo?",
  clearCache: "Borrar caché de mapas",
  clearCacheConfirm:
    "¿Eliminar todas las teselas de mapa almacenadas en este dispositivo (teselas guardadas en caché al navegar por los mapas)?",
  noAreas: "Aún no se ha descargado ningún área de mapa sin conexión",
  storage: {
    used: "Espacio usado por las teselas de mapa (áreas descargadas y caché):",
    free: "Espacio libre en el dispositivo:",
  },
  layers: {
    esriWorldImagery: "Satélite (Esri World Imagery)",
    openTopoMap: "Topográfico (OpenTopoMap)",
    openStreetMap: "Estándar (OpenStreetMap, solo en línea)",
  },
  mapTypes: {
    standard: "Estándar",
    satellite: "Satélite",
    hybrid: "Híbrido",
  },
  area: {
    surface: "Área: {{area}}",
    layer: "Capa: {{layer}}",
    zoomLevels: "Niveles de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Teselas: {{downloaded}} / {{total}}",
    size: "Tamaño: {{size}}",
    lastUpdate: "Última actualización: {{date}}",
    missingTiles: "Teselas faltantes: {{count}}",
    resumeDownload: "Descargar faltantes",
    deleteConfirm: "¿Eliminar el área de mapa sin conexión '{{name}}'?",
    nameRequired: "El nombre es obligatorio",
    nameDuplicate: "Nombre ya utilizado por otra área",
  },
  areaEditor: {
    title: "Nueva área de mapa sin conexión",
    name: "Nombre",
    layer: "Capa",
    maxZoom: "Zoom máximo: {{value}}",
    currentZoom: "Zoom actual: {{value}}",
    surface: "Área: {{area}}",
    drawAreaToEstimate:
      "Dibuja el área de interés en el mapa para ver el espacio que ocupará",
    estimate: "{{tiles}} teselas · ~{{size}} (espacio libre: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} teselas: demasiadas (máx. {{maxTiles}}); reduce el área o el zoom máximo",
    tooManyTiles:
      "El área es demasiado grande: se pueden descargar como máximo {{maxTiles}} teselas; reduce el área o el zoom máximo",
    notEnoughSpace: "No hay suficiente espacio libre en el dispositivo",
  },
  areaViewer: {
    title: "Área de mapa sin conexión",
    notFound: "Área de mapa sin conexión no encontrada",
  },
  download: {
    label: "Descargar",
    title: "Descargando teselas de mapa",
    complete: "Área de mapa sin conexión descargada ({{size}})",
    completeWithMissingTiles:
      "Área de mapa sin conexión descargada ({{size}}); no se pudieron descargar {{missingTiles}} teselas",
    error: "Error al descargar el área de mapa sin conexión: {{details}}",
  },
};
