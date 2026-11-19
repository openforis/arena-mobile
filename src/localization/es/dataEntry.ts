import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Este registro pertenece a otro grupo de usuarios: solo se puede ver. Clónelo para editarlo",
  autoSync: {
    checkbox: "Sincronización automática",
    synced: "{{count}} registro sincronizado automáticamente",
    synced_other: "{{count}} registros sincronizados automáticamente",
    statusLabel: "Estado de sincronización:",
    statusTitle: "Estado de sincronización",
    syncInProgressToast:
      "La sincronización automática está en curso. Espere a que finalice antes de enviar datos manualmente.",
    batteryDataWarning:
      "Puede aumentar el consumo de batería y datos si no está en Wi-Fi",
    syncNow: "Sincronizar ahora",
    recordSyncInProgress:
      "Este registro se está sincronizando con el servidor. Espere un momento",
    status: {
      syncedTooltip: "Todos los registros están sincronizados con el servidor",
      pendingTooltip:
        "Algunos registros aún deben sincronizarse. Se enviarán automáticamente",
      errorTooltip:
        "Algunos registros tienen errores de sincronización y requieren su atención. Abra 'Enviar datos' para resolverlos",
      needsManualFixTooltip:
        "Algunos registros no se pueden sincronizar hasta que los corrija (p. ej. valores clave faltantes, mismas claves que un registro ya existente en el servidor cuando no se permite fusionar, o ya no en la fase de ingreso). Verifique su estado de sincronización en la lista de registros",
      mergeWithSameKeysNotAllowedNote:
        "Algunos registros tienen la(s) misma(s) clave(s) que un registro ya existente en el servidor, y no se permite fusionarlos en esta encuesta. Si son registros diferentes, cambie sus valores clave; si son el mismo registro, contacte al administrador de la encuesta.",
      syncingTooltip: "Sincronizando registros...",
      progressPercent: "{{progressPercent}}%",
      uncheckedTooltip:
        "Estado de sincronización aún no verificado. Use 'Comprobar sincronización' para verificarlo",
      offlineTooltip:
        "Sin conexión a internet. La sincronización automática se reanudará al recuperar la conexión",
      authErrorTooltip:
        "Su sesión con el servidor ha expirado. Inicie sesión de nuevo para reanudar la sincronización automática",
      checkErrorTooltip:
        "No se pudo comprobar el estado de sincronización debido a un error del servidor. Inténtelo de nuevo",
      noCandidatesMessage: "Nada que enviar por ahora",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Los nodos ya no se aplicarán",
    message: `Los siguientes nodos ya no se aplicarán:  
  
{{attributeNames}}  
  
Sus valores serán borrados.  
¿Continuar?`,
  },
  confirmGoToListOfRecords:
    "¿Ir a la lista de registros?\n\n(todos los cambios ya están guardados)",
  checkStatus: "Comprobar sincronización",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Buscar el punto de muestreo más cercano",
    findingClosestSamplingPoint: "Buscando el punto de muestreo más cercano",
    minDistanceItemFound:
      "Elemento encontrado a una distancia de {{minDistance}} m",
    minDistanceItemFound_other:
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
  createRecordError: "Error al crear un nuevo registro: {{error}}",
  userGroupNotReady: {
    title: "Información de usuario no disponible",
    message: `La información de su grupo de usuario aún no se ha obtenido del servidor. Esta encuesta tiene atributos que se rellenan previamente según su grupo de usuario, por lo que crear el registro ahora podría dejarlos vacíos o incorrectos.

¿Desea obtenerla nuevamente del servidor?`,
    fetchAgain: "Obtener de nuevo",
    stillNotReady:
      "No se pudo obtener la información de su grupo de usuario del servidor. Registro no creado.",
  },
  updateAttributeError: "Error al actualizar el valor: {{error}}",
  cycle: "Ciclo",
  cycleForNewRecords: "Ciclo para nuevos registros:",
  options: "Opciones",
  editNodeDef: "Editar {{nodeDef}}",
  viewNodeDef: "Ver {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Error al obtener registros del servidor.\n\nComprobar configuración de conexión.\n\nDetalles: {{details}}",
  errorGeneratingRecordsExportFile:
    "Error al generar archivo de exportación de registros: {{details}}",
  errorLoadingRecords: "Error al cargar registros: {{details}}",
  exportNewOrUpdatedRecords: "Exportar registros nuevos o actualizados",
  formLanguage: "Idioma del formulario:",
  entityListColumns: {
    button: "Columnas",
    hideAll: "Ocultar todas",
    keys: "Atributos clave",
    other: "Otros atributos",
    reset: "Predeterminado",
    showAll: "Mostrar todas",
    summary: "Atributos de resumen",
    title: "Columnas visibles",
  },
  noEntitiesDefined: "No se han definido entidades",
  goToDataEntry: "Ir a la entrada de datos",
  goToListOfRecords: "Ir a la lista de registros",
  gpsLockingEnabledWarning: "Advertencia: ¡Bloqueo del GPS activado!",
  listOfRecords: "Registros",
  localBackup: "Copia de seguridad local",
  newRecord: "Nuevo registro",
  newRecordShort: "Nuevo",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "No se pueden agregar más elementos: se ha alcanzado el número máximo",
    },
    cannotDeleteNode: {
      noNodeFound: "No se puede eliminar el nodo: no se encontró el nodo",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "No se puede actualizar el valor: no se encontró el nodo",
    },
  },
  noRecordsFound: "No se encontraron registros",
  recordEditor: "Editor de registros",
  recordCompletion: {
    shortDescription: "{{percent}}% completado",
  },
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
    conflictingModifiedRemotely:
      "modificado en el dispositivo y en el servidor",
    withValidationErrors: "con errores de validación",
  },
  sendData: "Enviar datos",
  showOnlyLocalRecords: "Mostrar solo registros locales",
  syncedOn: "Sincronizado el",
  syncStatusHeader: "Estado",
  syncStatus: {
    conflictingKeys: "Ya existe un registro con la(s) misma(s) clave(s)",
    deviceDateBehindServer:
      "No cargado: la fecha del dispositivo es anterior a la del servidor (configura la fecha y hora correctas y luego vuelve a editar el registro)",
    keysNotSpecified: "Clave(s) no especificada(s)",
    new: "Nuevo (sin subir aún)",
    notModified: "Sin modificar (sin cambios para subir)",
    modifiedLocally: "Modificado localmente",
    modifiedLocallyAndRemotely:
      "Modificado localmente y en el servidor remoto (conflicto)",
    modifiedRemotely: "Modificado en el servidor remoto",
    notInEntryStepAnymore:
      "Ya no está en la fase de entrada (la fase de limpieza o análisis)",
  },
  processingData: {
    title: "Procesando datos",
  },
  uploadingData: {
    title: "Cargando datos",
    size: "Tamaño del archivo: {{size}}",
    speed: "Velocidad de carga: {{speed}}/s",
    eta: "Tiempo restante estimado: {{eta}}",
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
    selectItem_other: "Seleccionar elementos",
  },
  coordinate: {
    longPressMarkerToMove: "Mantén pulsado el marcador para moverlo",
    saveNewPosition: "Guardar nueva posición",
    accuracy: "Precisión (m)",
    altitude: "Altitud (m)",
    altitudeAccuracy: "Precisión de altitud (m)",
    angleToTargetLocation: "Ángulo al objetivo",
    confirmConvertCoordinate:
      "¿Convertir coordenada de SRS {{srsFrom}} a SRS {{srsTo}}?",
    connectingToSource: "Conectando con {{label}}...",
    convert: "Convertir",
    currentLocation: "Ubicación actual",
    distance: "Distancia (m)",
    externalGpsGenericLabel: "dispositivo GPS externo",
    getLocation: "Obtener ubicación",
    heading: "Orientación (grados)",
    map: {
      attributeViewerTitle: 'Ubicación de "{{attributeLabel}}"',
      chooserTitle: "Mostrar en el mapa",
      inApp: "Arena Mobile",
      inAppDescription: "Funciona sin conexión con mapas descargados",
      inAppDescriptionRelocatable:
        "Funciona sin conexión con mapas descargados.\nLa posición se puede reubicar",
      otherApp: "Otra aplicación…",
      otherAppDescription:
        "Elige entre todas las aplicaciones instaladas que pueden mostrar una ubicación",
      show: "Mostrar",
      targetViewerTitle: 'Ubicación objetivo de "{{attributeLabel}}"',
      viewerTitle: "Ubicación",
    },
    headingOffset: "Desviación de rumbo",
    headingSource: "Fuente de rumbo",
    headingSourceMagnetometer: "Sensor",
    headingSourceLocation: "GPS",
    keepXAndY: "Mantener X e Y",
    locationHeadingNotAvailable: "¡Rumbo GPS no disponible!",
    magnetometerNotAvailable: "¡Magnetómetro no disponible!",
    navigateToTarget: "Navegar al objetivo",
    srs: "$t(common:srs)",
    targetLocation: "Ubicación de destino",
    useCurrentLocation: "Usar ubicación actual",
    usingInternalFallback: "Usando GPS interno ({{label}} no disponible)",
    usingSource: "Usando {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Brújula",
    viewModeRadar: "Radar",
    locationNavigatorInfo: {
      title: "Navegador de ubicación",
      description:
        "Te guía hacia una coordenada objetivo usando el GPS y los sensores del dispositivo. Muestra la ubicación objetivo en relación con tu posición actual y te permite navegar hasta ella en el campo.",
      viewModesTitle: "Modos de vista",
      compassTitle: "Brújula",
      compassDesc:
        "Muestra una rosa de los vientos giratoria orientada al norte. Una flecha apunta hacia el objetivo. Cuando estás muy cerca del objetivo (modo de proximidad), la flecha se sustituye por un punto en el círculo de precisión que indica la posición relativa del objetivo.",
      radarTitle: "Radar",
      radarDesc:
        "Muestra una vista de radar desde arriba con tu posición fija en el centro. El punto objetivo se mueve a tu alrededor en tiempo real para reflejar su dirección y distancia reales.",
      headingSourcesTitle: "Fuentes de rumbo",
      sensorTitle: "Sensor (magnetómetro)",
      sensorDesc:
        "Usa el magnetómetro integrado del dispositivo (chip de brújula). Funciona estando quieto, pero puede verse afectado por objetos metálicos cercanos o interferencias magnéticas.",
      gpsTitle: "GPS",
      gpsDesc:
        "Obtiene el rumbo a partir del movimiento GPS. Es más preciso en espacios abiertos, pero requiere que estés caminando y puede no estar disponible en todos los dispositivos.",
    },
  },
  geo: {
    drawPolygon: "Dibujar polígono",
    editPolygon: "Editar polígono",
    selectPolygonInstruction: "Presione en un polígono para seleccionarlo",
    selectPointInstructions: `- Toca un punto para seleccionarlo.  
- Toca un punto medio para añadir un nuevo punto.`,
    editPolygonInstructions:
      "Mantén pulsado el punto seleccionado y arrástralo para moverlo.",
    tapToAddPoints: `Toca el mapa para añadir puntos.  
Presiona '$t(common:stop)' cuando hayas terminado.`,
    deleteSelectedPoint: "Eliminar punto seleccionado",
    addCurrentLocationPoint: "Agregar ubicación actual",
    addCurrentLocationPointInstructions:
      "Pulsa '$t(dataEntry:geo.addCurrentLocationPoint)' para agregar la ubicación actual al polígono",
  },
  positionTracking: {
    title: "Seguimiento de posición",
    start: "Iniciar seguimiento",
    resume: "Reanudar",
    restart: "Reiniciar",
    restartConfirm: {
      title: "¿Eliminar el recorrido grabado?",
      message:
        "Se eliminarán todos los puntos grabados hasta ahora en este atributo y el seguimiento empezará desde cero. Esta acción no se puede deshacer.",
    },
    delete: "Eliminar recorrido",
    deleteConfirm: {
      title: "¿Eliminar el recorrido grabado?",
      message:
        "Se eliminarán todos los puntos grabados en este atributo y el atributo quedará vacío. Esta acción no se puede deshacer.",
    },
    stop: "Detener",
    showTrack: "Mostrar recorrido",
    retry: "Reintentar",
    status: {
      idle: "Sin seguimiento",
      stopped: "Seguimiento detenido",
      starting: "Iniciando seguimiento…",
      tracking: "Seguimiento en curso",
      paused: "Seguimiento en pausa",
    },
    waitingForFix: "Esperando GPS…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "{{count}} puntos",
    trackSummary: "{{length}} · {{pointsCount}} puntos · {{duration}}",
    attributeNotEditable:
      "El valor de este atributo se registra mediante el seguimiento de posición",
    stopConfirm:
      "¿Detener el seguimiento? El recorrido grabado se guarda en el atributo y se puede continuar más tarde.",
    stopCurrentConfirm:
      "Se está siguiendo otro atributo: ¿detener su seguimiento e iniciar el seguimiento de este?",
    interrupted:
      "El seguimiento de posición se interrumpió: el recorrido grabado se ha guardado. Reanuda el seguimiento para continuar.",
    error: {
      generic: "No se puede iniciar el seguimiento de posición",
      permissionDenied:
        "No se puede seguir la posición: acceso a la ubicación no concedido",
      locationServicesOff:
        "No se puede seguir la posición: los servicios de ubicación están desactivados",
      notSaved:
        "El recorrido aún no se pudo guardar en el atributo: se guardará más tarde",
    },
  },
  taxon: {
    search: "Buscar taxón",
    taxonNotSelected: "--- Taxón no seleccionado ---",
  },
  fileAttribute: {
    selectAudio: "Seleccionar audio",
    selectFile: "Seleccionar archivo",
    selectPicture: "Seleccionar imagen",
    selectVideo: "Seleccionar video",
    deleteConfirmMessage: "¿Eliminar el archivo existente?",
    fileMissing: "Archivo no encontrado en el almacenamiento local",
    fileSelectError: "Error al seleccionar el archivo: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Error al iniciar la grabación de audio: {{error}}",
      pausingRecording: "Error al pausar la grabación de audio: {{error}}",
      resumingRecording: "Error al reanudar la grabación de audio: {{error}}",
      savingRecording: "Error al guardar la grabación de audio",
      stoppingRecording: "Error al detener la grabación de audio: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Vista previa de la imagen",
    pictureResizedToSize: `Imagen redimensionada a {{size}}.
Tamaño máximo permitido: {{maxSizeMB}}MB.
Verifique la configuración o pida al administrador de la encuesta que cambie este límite.`,
    resolution: "Resolución",
    rotate: "Rotar",
    cameraOpenError: "Error al abrir la cámara: {{error}}",
    rotationError: "Error al rotar la imagen: {{error}}",
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
    mergeConflictingRecords: "Fusionar registros conflictivos",
    mergeWithSameKeysNotAllowed:
      "No se permite fusionar registros con la(s) misma(s) clave(s) en esta encuesta, por lo que los registros con claves conflictivas no se enviarán. Si son registros diferentes, cambie sus valores clave; si son el mismo registro, contacte al administrador de la encuesta.",
    mergeSameRecordConflictConfirm: {
      title: "Fusionar registros editados en ambos dispositivos",
      message: `{{count}} registro(s) también se modificaron en el servidor desde la última sincronización de este dispositivo.

Al fusionar se combinarán sus cambios con los cambios del servidor: para cada campo, se mantendrá el valor editado más recientemente, y se conservará cualquier sección nueva añadida en cualquiera de los dos dispositivos.

Esto no se puede previsualizar de antemano. Deslice para confirmar y continuar.`,
    },
    noRecordsInDeviceToExport:
      "No hay registros en el dispositivo para exportar",
    onlyNewOrUpdatedRecords: "Exportar solo registros nuevos o actualizados",
    recordsMergedMessage: `Los siguientes registros se han fusionado con la versión más reciente que ya existía en el servidor:
{{recordsList}}

La versión fusionada de esos registros se ha descargado automáticamente.`,
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
    recordsWithMissingFilesConfirm: {
      confirmButton: "Exportar sin archivos faltantes",
      title: "Archivos faltantes",
      message: `Los siguientes registros tienen archivos faltantes y se exportarán sin ellos:\n{{recordsList}}\n\n¿Desea continuar de todos modos?`,
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
