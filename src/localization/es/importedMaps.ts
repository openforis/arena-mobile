export default {
  title: "Mapas importados",
  description:
    "Importa mapas desde archivos PDF o GeoTIFF geoespaciales (georreferenciados) guardados en este dispositivo: se muestran sobre el mapa base en todos los mapas de la aplicación, incluso sin conexión a internet.",
  rendererNotAvailable:
    "Esta versión de la aplicación no admite mapas importados: actualízala a la última versión",
  importMap: "Importar mapa",
  noMaps: "Aún no se ha importado ningún mapa",
  storage: {
    used: "Espacio usado por los mapas importados:",
  },
  opacity: "Opacidad: {{value}}%",
  hideBaseMap: "Solo mapa importado",
  map: {
    fileName: "Archivo: {{fileName}}",
    page: "Página: {{page}}",
    zoomLevels: "Niveles de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Teselas: {{count}}",
    size: "Tamaño: {{size}} (archivo PDF: {{sourceSize}})",
    sizeTilesOnly: "Tamaño: {{size}}",
    datumWarning:
      "El datum del mapa no es WGS84: el mapa podría estar desplazado algunos metros",
    visible: "Mostrar en los mapas",
    deleteConfirm: "¿Eliminar el mapa '{{name}}'?",
    notFound: "Mapa no encontrado",
    viewerTitle: "Mapa importado",
  },
  import: {
    title: "Importar mapa",
    analyzing: "Leyendo la georreferenciación del archivo...",
    errorReading: "Error al leer el archivo: {{details}}",
    notGeoreferenced:
      "El archivo no está georreferenciado: no contiene las coordenadas geográficas del mapa",
    unsupportedGeoreference:
      "La georreferenciación de este archivo PDF (codificación OGC GeoPDF) aún no es compatible",
    unsupportedFile: "El archivo no es un PDF ni un GeoTIFF",
    unsupportedGeoTiffFormat:
      "Las imágenes de este archivo GeoTIFF no son compatibles ({{details}}): solo se pueden importar imágenes de 8 bits por muestra (RGB, RGBA, escala de grises o con paleta de colores)",
    page: "Página",
    pageItem: "Página {{page}}",
    name: "Nombre",
    maxZoom: "Zoom máx.: {{value}}",
    nativeZoom: "(resolución del mapa: {{value}})",
    maxZoomAboveNative:
      "Los niveles de zoom superiores a la resolución del mapa se verán borrosos",
    estimate: "{{tiles}} teselas · ~{{size}} (espacio libre: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} teselas: demasiadas (máx. {{maxTiles}}); reduce el zoom máximo",
    tooManyTiles:
      "Demasiadas teselas: se pueden generar como máximo {{maxTiles}} teselas; reduce el zoom máximo",
    notEnoughSpace: "No hay suficiente espacio libre en el dispositivo",
    lowSpaceConfirm: {
      title: "Poco espacio libre",
      message:
        "El mapa ocupará unos {{size}}, el {{percent}}% del espacio libre del dispositivo ({{freeSpace}}). ¿Continuar?",
    },
    preview: {
      rendering: "Generando la vista previa...",
      lowResolution:
        "Vista previa en baja resolución (niveles de zoom {{minZoom}} - {{maxZoom}})",
      error: "Vista previa no disponible: {{details}}",
    },
    importButton: "Importar",
    jobTitle: "Importando el mapa",
    complete: "Mapa importado ({{size}})",
    error: "Error al importar el mapa: {{details}}",
  },
  validation: {
    nameRequired: "El nombre es obligatorio",
    nameDuplicate: "Nombre ya usado por otro mapa importado",
  },
};
