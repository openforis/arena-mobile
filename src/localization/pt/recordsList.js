export default {
  cloneRecords: {
    title: "Clonar",
    confirm: {
      message:
        "Clonar os {{recordsCount}} registos selecionados para o ciclo {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Apenas registos importados para o dispositivo ou modificados localmente podem ser clonados para o próximo ciclo",
    completeSuccessfully:
      "Registos clonados com sucesso para o ciclo {{cycle}}!",
  },
  confirmImportRecordFromServer: "Importar registo do servidor?",
  continueEditing: {
    title: "Continuar a editar",
    commands: {
      message: "Continuar a editar de onde parou?",
    },
  },
  dateModifiedRemotely: "Data de modificação remota",
  deleteRecordsConfirm: {
    title: "Excluir registos",
    message: "Excluir os registos selecionados?",
  },
  duplicateKey: {
    title: "Chave duplicada",
    message: "Já existe outro registo com a mesma chave ({{keyValues}}).",
  },
  exportRecords: {
    title: "Exportar",
  },
  importRecord: "Importar registo",
  importRecords: {
    title: "Importar do servidor",
    error: {
      surveyNotVisibleInMobile:
        "Não é possível importar registros: esta pesquisa não deve ser visível no Arena Mobile",
      recordsDownloadNotAllowed:
        "A importação de registros do servidor Arena não é permitida",
    },
  },
  importRecordsFromFile: {
    title: "Importar",
    confirmMessage: "Importar registos do ficheiro selecionado\n{{fileName}}?",
    invalidFileType: "Tipo de ficheiro inválido (esperado .zip)",
    overwriteExistingRecords: "Subscrever registos existentes",
    selectFile: "Selecionar ficheiro",
  },
  importCompleteSuccessfully:
    "Importação de registos concluída com sucesso!\n- {{processedRecords}} registos processados\n- {{insertedRecords}} registos inseridos\n- {{updatedRecords}} registos atualizados",
  importFailed: "Falha na importação de registos: {{details}}",
  loadStatus: {
    title: "Carregado",
    C: "Completo",
    P: "Parcial (sem ficheiros)",
    S: "Apenas resumo",
  },
  origin: {
    title: "Origem",
    L: "Local",
    R: "Remoto",
  },
  owner: "Proprietário",
  sendData: {
    error: {
      generic: "Não é possível enviar dados para o servidor: {{details}}",
      surveyNotVisibleInMobile:
        "A pesquisa atual não deve ser visível no Arena Mobile",
      recordsUploadNotAllowed:
        "O upload de registros do Arena Mobile para o servidor não é permitido",
    },
  },
};
