export default {
  confirmGoToListOfRecords:
    "¿Ir a la lista de registros?\n\n(todos los cambios ya están guardados)",
  checkSyncStatus: "Comprobar sincronización",
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
  cycle: "Ciclo",
  cycleForNewRecords: "Ciclo para nuevos registros:",
  options: "Opciones",
  editNodeDef: "Editar {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Error al obtener registros del servidor.\n\nComprobar configuración de conexión.\n\nDetalles: {{details}}",
  errorGeneratingRecordsExportFile:
    "Error al generar archivo de exportación de registros: {{details}}",
  errorLoadingRecords: "Error al cargar registros: {{details}}",
  exportData: {
    title: "Exportar datos",
    confirm: {
      title: "Confirmar exportación de datos",
      message:
        "Registros a exportar:\n- {{newRecordsCount}} nuevos registros;\n- {{updatedRecordsCount}} registros actualizados\n- {{conflictingRecordsCount}} registros conflictivos",
    },
    noRecordsInDeviceToExport:
      "No hay registros en el dispositivo para exportar",
    onlyNewOrUpdatedRecords: "Exportar solo registros nuevos o actualizados",
    mergeConflictingRecords: "Fusionar registros conflictivos (mismas claves)",
    onlyRecordsInRemoteServerCanBeImported:
      "Solo se pueden importar registros que ya están en el servidor remoto o registros que se han actualizado remotamente",
  },
  exportNewOrUpdatedRecords: "Exportar registros nuevos o actualizados",
  formLanguage: "Idioma del formulario:",
  noEntitiesDefined: "No se han definido entidades",
  goToDataEntry: "Ir a la entrada de datos",
  goToListOfRecords: "Ir a la lista de registros",
  gpsLockingEnabledWarning: "Advertencia: ¡Bloqueo del GPS activado!",
  listOfRecords: "Lista de registros",
  localBackup: "Copia de seguridad local",
  newRecord: "Nuevo",
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
    pictureResizedToSize: "Imagen redimensionada a {{size}}",
    resolution: "Resolución",
  },
  dataExport: {
    error: "Error al exportar datos. Detalles: {{details}}",
    selectTarget: "Seleccionar destino de exportación",
    selectTargetMessage: "Seleccionar el destino de la exportación:",
    target: {
      remote: "Servidor remoto",
      local: "Carpeta local (Descarga)",
      share: "Compartir archivo",
    },
    shareExportedFile: "Compartir archivo exportado",
  },
  location: {
    gettingCurrentLocation: "Obteniendo ubicación actual",
    usingCurrentLocation: "Usando ubicación actual",
  },
  unlock: {
    label: "Desbloquear",
    confirmMessage: "La edición del registro está bloqueada; ¿desbloquearla?",
    confirmTitle: "Edición bloqueada",
  },
};
