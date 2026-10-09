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
  customLayers: {
    title: "Capas de mapa personalizadas",
    description:
      "Añade capas de mapa de otros proveedores de teselas (teselas ráster XYZ), con una clave API si el proveedor la requiere. Se pueden seleccionar como capa de mapa predeterminada en los ajustes y con el botón de capas del mapa. Asegúrate de que las condiciones de uso del proveedor lo permitan.",
    add: "Añadir capa",
    noLayers: "Aún no hay capas de mapa personalizadas",
    maxZoom: "Zoom máx.: {{value}}",
    deleteConfirm:
      "¿Eliminar la capa de mapa personalizada '{{name}}' y sus teselas almacenadas en este dispositivo?",
    deleteConfirmWithOfflineAreas:
      "¿Eliminar la capa de mapa personalizada '{{name}}', sus teselas almacenadas en este dispositivo y las áreas de mapa sin conexión descargadas con ella ({{count}})?",
    editor: {
      title: "Capa de mapa personalizada",
      name: "Nombre",
      url: "Plantilla de URL",
      urlHint:
        "Ejemplo: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} y {z} son obligatorios; {apiKey} se sustituye por la clave API.",
      apiKey: "Clave API (opcional)",
      apiKeyHint:
        "Se guarda en el almacenamiento seguro del dispositivo y se usa solo en las solicitudes al proveedor de teselas.",
      attribution: "Atribución (opcional)",
      attributionHint:
        "Aviso de derechos de autor requerido por el proveedor; se muestra en el mapa.",
      urlChangeConfirm:
        "La plantilla de URL ha cambiado: las teselas de esta capa almacenadas en este dispositivo se eliminarán y sus áreas de mapa sin conexión ({{count}}) deberán descargarse de nuevo. ¿Continuar?",
      test: {
        label: "Probar",
        success: "Tesela de mapa descargada correctamente",
        errorStatus:
          "El proveedor de teselas no devolvió una tesela de mapa (estado HTTP: {{status}}); comprueba la plantilla de URL y la clave API",
        errorNotReachable:
          "No se puede contactar con el proveedor de teselas; comprueba la plantilla de URL y la conexión a internet",
      },
    },
    validation: {
      nameRequired: "El nombre es obligatorio",
      nameDuplicate: "Nombre ya utilizado por otra capa",
      urlRequired: "La plantilla de URL es obligatoria",
      urlNotHttps: "La plantilla de URL debe empezar por https://",
      urlPlaceholdersMissing:
        "La plantilla de URL debe contener los marcadores {x}, {y} y {z}",
      urlSubdomainNotSupported:
        "El marcador {s} no es compatible: sustitúyelo por uno de los subdominios del proveedor (p. ej. 'a')",
      apiKeyRequired:
        "La plantilla de URL contiene {apiKey}: la clave API es obligatoria",
      apiKeyPlaceholderMissing:
        "Añade el marcador {apiKey} a la plantilla de URL, donde se espera la clave API",
    },
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
    customLayerConfirm: {
      title: "Capa de mapa personalizada",
      message:
        "Se descargarán unas {{tiles}} teselas de '{{layer}}'. Asegúrate de que las condiciones de uso del proveedor permitan las descargas masivas: podrían estar prohibidas o tener coste. ¿Continuar?",
    },
    lowSpaceConfirm: {
      title: "Poco espacio libre",
      message:
        "La descarga ocupará aproximadamente {{size}}, el {{percent}}% del espacio libre en el dispositivo ({{freeSpace}}). ¿Continuar?",
    },
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
