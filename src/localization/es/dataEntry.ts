import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords:
    "¿Ir a la lista de registros?\n\n(todos los cambios ya están guardados)",
  checkStatus: "Comprobar sincronización",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Buscar el punto de muestreo más cercano",
    findingClosestSamplingPoint: "Buscando el punto de muestreo más cercano",
    minDistanceItemFound:
      "Elemento encontrado a una distancia de {{minDistance}} m",
    minDistanceItemFound_plural:
      "Elementos encontrados a una distancia de {{minDistance}} m",
    useSelectedItem: "Usar elemento seleccionado",
  },
  confirmDeleteSelectedItems: {
    message: "¿Eliminar los elementos seleccionados?",
  },
  confirmDeleteValue: {
    message: "¿Eliminar este valor?",
  },
  confirmOverwriteValue: {
    message: "¿Sobrescribir valor existente?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Si continúa, algunas entidades enumeradas dependientes ({{entityDefs}}) se volverán a enumerar, eliminando los valores existentes insertados en ellas (si los hay).\n\n¿Actualizar las entidades enumeradas?",
    title: "Actualizar entidades enumeradas",
  },
  cycle: "Ciclo",
  cycleForNewRecords: "Ciclo para nuevos registros:",
  options: "Opciones",
  editNodeDef: "Editar {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Error al obtener registros del servidor.\n\nComprobar configuración de conexión.\n\nDetalles: {{details}}",
  errorGeneratingRecordsExportFile:
    "Error al generar archivo de exportación de registros: {{details}}",
  errorLoadingRecords: "Error al cargar registros: {{details}}",
  exportNewOrUpdatedRecords: "Exportar registros nuevos o actualizados",
  formLanguage: "Idioma del formulario:",
  noEntitiesDefined: "No se han definido entidades",
  goToDataEntry: "Ir a la entrada de datos",
  goToListOfRecords: "Ir a la lista de registros",
  gpsLockingEnabledWarning: "Advertencia: ¡Bloqueo del GPS activado!",
  listOfRecords: "Registros",
  localBackup: "Copia de seguridad local",
  newRecord: "Nuevo",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "No se pueden agregar más elementos: se ha alcanzado el número máximo",
    },
  },
  noRecordsFound: "No se encontraron registros",
  recordEditor: "Editor de registros",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Mostrar valores del ciclo anterior",
      message: "Seleccionar ciclo anterior:",
      cycleItem: "Ciclo {{cycleLabel}}",
    },
    foundMessage: "¡Registro encontrado en ciclo anterior!",
    notFoundMessage:
      "No se encontró registro en ciclo {{cycle}} con claves {{keyValues}}",
    confirmFetchRecordInCycle:
      "Registro en ciclo {{cycle}} con claves {{keyValues}} no está completamente cargado; ¿descargarlo del servidor?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): obtener lista de registros del servidor e intentarlo de nuevo?",
    fetchError: "Error al obtener registro en ciclo anterior: {{details}}",
    multipleRecordsFound:
      "Se encontraron múltiples registros con claves {{keyValues}} en ciclo {{cycle}}",
    valuePanelHeader: "Valor en ciclo {{prevCycle}}",
  },
  recordStatus: {
    new: "nuevo",
    updated: "actualizado",
    conflicting: "en conflicto",
    withValidationErrors: "con errores de validación",
  },
  sendData: "Enviar datos",
  showOnlyLocalRecords: "Mostrar solo registros locales",
  syncedOn: "Sincronizado el",
  syncStatusHeader: "Estado",
  syncStatus: {
    conflictingKeys: "Ya existe un registro con la(s) misma(s) clave(s)",
    keysNotSpecified: "Clave(s) no especificada(s)",
    new: "Nuevo (sin subir aún)",
    notModified: "Sin modificar (sin cambios para subir)",
    modifiedLocally: "Modificado localmente",
    modifiedRemotely: "Modificado en el servidor remoto",
    notInEntryStepAnymore:
      "Ya no está en la fase de entrada (la fase de limpieza o análisis)",
  },
  uploadingData: {
    title: "Cargando datos",
  },
  validationReport: {
    title: "Informe de validación",
    noErrorsFound: "¡Enhorabuena, no se encontraron errores!",
  },
  viewModeLabel: "Modo de visualización",
  viewMode: {
    form: "Formulario",
    oneNode: "Un nodo",
  },
  code: {
    selectItem: "Seleccionar elemento",
    selectItem_plural: "Seleccionar elementos",
  },
  coordinate: {
    accuracy: "Precisión (m)",
    altitude: "Altitud (m)",
    altitudeAccuracy: "Precisión de altitud (m)",
    angleToTargetLocation: "Ángulo al objetivo",
    confirmConvertCoordinate:
      "¿Convertir coordenada de SRS {{srsFrom}} a SRS {{srsTo}}?",
    convert: "Convertir",
    currentLocation: "Ubicación actual",
    distance: "Distancia (m)",
    getLocation: "Obtener ubicación",
    heading: "Orientación (grados)",
    keepXAndY: "Mantener X e Y",
    magnetometerNotAvailable: "¡Magnetómetro no disponible!",
    navigateToTarget: "Navegar al objetivo",
    srs: "$t(common:srs)",
    useCurrentLocation: "Usar ubicación actual",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Buscar taxón",
    taxonNotSelected: "--- Taxón no seleccionado ---",
  },
  fileAttribute: {
    chooseAudio: "Elegir un archivo de audio",
    chooseFile: "Elegir un archivo",
    choosePicture: "Elegir una imagen",
    chooseVideo: "Elegir un video",
    deleteConfirmMessage: "¿Eliminar el archivo existente?",
  },
  fileAttributeImage: {
    imagePreview: "Vista previa de la imagen",
    pictureResizedToSize: `Imagen redimensionada a {{size}}.
Tamaño máximo permitido: {{maxSizeMB}}MB.
Verifique la configuración o pida al administrador de la encuesta que cambie este límite.`,
    resolution: "Resolución",
  },
  dataExport: {
    confirm: {
      title: "Confirmar exportación de datos",
      message: `Registros a exportar:
{{recordsCountSummary}}`,
      selectOptions: `Seleccionar opciones de exportación:`,
    },

    error: "Error al exportar datos. Detalles: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Los datos se exportaron correctamente, pero faltan o están rotos {{missingFiles}} archivos/imágenes. Por favor, revise sus registros y también los registros en el servidor.",
    exportingData: "Exportando datos...",
    exportToCsv: "Exportar a CSV",
    mergeConflictingRecords: "Fusionar registros conflictivos (mismas claves)",
    noRecordsInDeviceToExport:
      "No hay registros en el dispositivo para exportar",
    onlyNewOrUpdatedRecords: "Exportar solo registros nuevos o actualizados",
    onlyRecordsInRemoteServerCanBeImported:
      "Solo se pueden importar registros que ya están en el servidor remoto o registros que se han actualizado remotamente",
    option: {
      [FlatDataExportOption.addCycle]: "Añadir ciclo",
      [FlatDataExportOption.includeAncestorAttributes]: "Atributos ancestrales",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Etiquetas de elementos de categoría",
      [FlatDataExportOption.includeFiles]: "Atributos de archivo",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Nombre científico del taxón",
    },
    selectTarget: "Seleccionar destino de exportación",
    selectTargetMessage: "Seleccionar el destino de la exportación:",
    shareExportedFile: "Compartir archivo exportado",
    target: {
      remote: "Servidor remoto",
      local: "Carpeta local (Descarga)",
      share: "$t(common:shareFile)",
    },
    title: "Exportar datos",
  },
  location: {
    label: "Ubicación",
    gettingCurrentLocation: "Obteniendo ubicación actual",
    usingCurrentLocation: "Usando ubicación actual",
  },
  unlock: {
    label: "Desbloquear",
    confirmMessage: "La edición del registro está bloqueada; ¿desbloquearla?",
    confirmTitle: "Edición bloqueada",
  },
};
