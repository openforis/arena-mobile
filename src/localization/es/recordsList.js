export default {
  cloneRecords: {
    title: "Clonar",
    confirm: {
      message:
        "¿Clonar los {{recordsCount}} registros seleccionados al ciclo {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Solo registros importados al dispositivo o modificados localmente pueden clonarse al siguiente ciclo",
    completeSuccessfully:
      "¡Registros clonados correctamente al ciclo {{cycle}}!",
  },
  confirmImportRecordFromServer: "¿Importar registro del servidor?",
  dateModifiedRemotely: "Fecha de modificación remota",
  deleteRecordsConfirm: {
    title: "Eliminar registros",
    message: "¿Eliminar los registros seleccionados?",
  },
  duplicateKey: {
    title: "Clave duplicada",
    message: "Ya existe otro registro con la misma clave ({{keyValues}}).",
  },
  exportRecords: {
    title: "Exportar",
  },
  importRecord: "Importar registro",
  importRecords: {
    title: "Importar desde el servidor",
  },
  importRecordsFromFile: {
    title: "Importar",
    confirmMessage:
      "¿Importar registros del archivo seleccionado\n{{fileName}}?",
    invalidFileType: "Tipo de archivo no válido (se esperaba .zip)",
    overwriteExistingRecords: "Sobrescribir registros existentes",
    selectFile: "Seleccionar archivo",
  },
  importCompleteSuccessfully:
    "¡Importación de registros completada correctamente!\n- {{processedRecords}} registros procesados\n- {{insertedRecords}} registros insertados\n- {{updatedRecords}} registros actualizados",
  importFailed: "Error en la importación de registros: {{details}}",
  loadStatus: {
    title: "Cargado",
    C: "Completo",
    P: "Parcial (sin archivos)",
    S: "Solo resumen",
  },
  origin: {
    title: "Origen",
    L: "Local",
    R: "Remoto",
  },
  owner: "Propietario",
};
