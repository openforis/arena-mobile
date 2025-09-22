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
  continueEditing: {
    title: "Continuar editando",
    confirm: {
      message: "¿Continuar editando donde lo dejó?",
    },
  },
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
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "No se pueden importar registros: esta encuesta no debería ser visible en Arena Mobile",
      recordsDownloadNotAllowed:
        "No se permite importar registros desde el servidor de Arena",
    },
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
  sendData: {
    error: {
      generic: "No se pueden enviar datos al servidor: {{details}}",
      surveyNotVisibleInMobile:
        "La encuesta actual no debería ser visible en Arena Mobile",
      recordsUploadNotAllowed: "No se permite subir registros al servidor",
      recordsWithErrorsUploadNotAllowed:
        "No se permite subir registros con errores de validación al servidor",
    },
  },
};
