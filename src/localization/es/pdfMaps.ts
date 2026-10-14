export default {
  title: "Mapas PDF",
  description:
    "Importa mapas desde archivos PDF geoespaciales (georreferenciados) guardados en este dispositivo: se muestran sobre el mapa base en todos los mapas de la aplicación, incluso sin conexión a internet.",
  rendererNotAvailable:
    "Esta versión de la aplicación no admite mapas PDF: actualízala a la última versión",
  importPdf: "Importar PDF",
  noMaps: "Aún no se ha importado ningún mapa PDF",
  storage: {
    used: "Espacio usado por los mapas PDF:",
  },
  opacity: "Opacidad: {{value}}%",
  hideBaseMap: "Solo PDF",
  map: {
    fileName: "Archivo: {{fileName}}",
    page: "Página: {{page}}",
    zoomLevels: "Niveles de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Teselas: {{count}}",
    size: "Tamaño: {{size}} (archivo PDF: {{sourceSize}})",
    datumWarning:
      "El datum del mapa no es WGS84: el mapa podría estar desplazado algunos metros",
    visible: "Mostrar en los mapas",
    deleteConfirm: "¿Eliminar el mapa PDF '{{name}}'?",
    notFound: "Mapa PDF no encontrado",
    viewerTitle: "Mapa PDF",
  },
  import: {
    title: "Importar mapa PDF",
    analyzing: "Leyendo la georreferenciación del archivo PDF...",
    errorReading: "Error al leer el archivo PDF: {{details}}",
    notGeoreferenced:
      "El archivo PDF no está georreferenciado: no contiene las coordenadas geográficas del mapa",
    unsupportedGeoreference:
      "La georreferenciación de este archivo PDF (codificación OGC GeoPDF) aún no es compatible",
    page: "Página",
    pageItem: "Página {{page}}",
    name: "Nombre",
    maxZoom: "Zoom máx.: {{value}}",
    nativeZoom: "(resolución del PDF: {{value}})",
    maxZoomAboveNative:
      "Los niveles de zoom superiores a la resolución del PDF se verán borrosos",
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
    jobTitle: "Importando mapa PDF",
    complete: "Mapa PDF importado ({{size}})",
    error: "Error al importar el mapa PDF: {{details}}",
  },
  validation: {
    nameRequired: "El nombre es obligatorio",
    nameDuplicate: "Nombre ya usado por otro mapa PDF",
  },
};
