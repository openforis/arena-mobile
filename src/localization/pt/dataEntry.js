export default {
  confirmGoToListOfRecords:
    "Ir para a lista de registos?\n\n(todas as alterações já foram gravadas)",
  checkSyncStatus: "Verificar sincronização",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Encontrar ponto de amostragem mais próximo",
    findingClosestSamplingPoint: "A encontrar ponto de amostragem mais próximo",
    minDistanceItemFound:
      "Item encontrado a uma distância de {{minDistance}} m",
    minDistanceItemFound_plural:
      "Itens encontrados a uma distância de {{minDistance}} m",
    useSelectedItem: "Usar item selecionado",
  },
  confirmDeleteSelectedItems: {
    message: "Excluir os itens selecionados?",
  },
  confirmDeleteValue: {
    message: "Excluir este valor?",
  },
  confirmOverwriteValue: {
    message: "Subscrever valor existente?",
  },
  cycle: "Ciclo",
  cycleForNewRecords: "Ciclo para novos registos:",
  options: "Opções",
  editNodeDef: "Editar {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Erro ao obter registos do servidor.\n\nVerificar definições de ligação.\n\nDetalhes: {{details}}",
  errorGeneratingRecordsExportFile:
    "Erro ao gerar ficheiro de exportação de registos: {{details}}",
  errorLoadingRecords: "Erro ao carregar registros: {{details}}",
  exportData: {
    title: "Exportar dados",
    confirm: {
      title: "Confirmar exportação de dados",
      message:
        "Registos a exportar:\n- {{newRecordsCount}} novos registos;\n- {{updatedRecordsCount}} registos atualizados\n- {{conflictingRecordsCount}} registos com conflitos",
    },
    noRecordsInDeviceToExport:
      "Não existem registos no dispositivo para exportar",
    onlyNewOrUpdatedRecords: "Exportar apenas registos novos ou atualizados",
    mergeConflictingRecords: "Unir registos com conflitos (mesmas chaves)",
    onlyRecordsInRemoteServerCanBeImported:
      "Apenas registos já presentes no servidor remoto ou registos que foram atualizados remotamente podem ser importados",
  },
  exportNewOrUpdatedRecords: "Exportar registos novos ou atualizados",
  formLanguage: "Idioma do formulário:",
  noEntitiesDefined: "Nenhuma entidade definida",
  goToDataEntry: "Ir para a introdução de dados",
  goToListOfRecords: "Ir para a lista de registos",
  gpsLockingEnabledWarning: "Aviso: Bloqueio de GPS ativado!",
  listOfRecords: "Lista de registos",
  localBackup: "Cópia de segurança local",
  newRecord: "Novo",
  noRecordsFound: "Nenhum registo encontrado",
  recordEditor: "Editor de registos",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Mostrar valores do ciclo anterior",
      message: "Selecionar ciclo anterior:",
      cycleItem: "Ciclo {{cycleLabel}}",
    },
    foundMessage: "Registo encontrado no ciclo anterior!",
    notFoundMessage:
      "Registo no ciclo {{cycle}} com as chaves {{keyValues}} não encontrado",
    confirmFetchRecordInCycle:
      "Registo no ciclo {{cycle}} com as chaves {{keyValues}} não totalmente carregado; descarregá-lo do servidor?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): obter a lista de registos do servidor e tentar novamente?",
    fetchError: "Erro ao obter registo no ciclo anterior: {{details}}",
    multipleRecordsFound:
      "Vários registos com as chaves {{keyValues}} encontrados no ciclo {{cycle}}",
    valuePanelHeader: "Valor no ciclo {{prevCycle}}",
  },
  sendData: "Enviar dados",
  showOnlyLocalRecords: "Mostrar apenas registos locais",
  syncedOn: "Sincronizado em",
  syncStatusHeader: "Estado",
  syncStatus: {
    conflictingKeys: "Já existe um registo com a(s) mesma(s) chave(s)",
    keysNotSpecified: "Chave(s) não especificada(s)",
    new: "Novo (ainda não carregado)",
    notModified: "Não modificado (sem alterações para carregar)",
    modifiedLocally: "Modificado localmente",
    modifiedRemotely: "Modificado no servidor remoto",
    notInEntryStepAnymore:
      "Já não está na etapa de introdução (na etapa de limpeza ou análise)",
  },
  validationReport: {
    title: "Relatório de validação",
    noErrorsFound: "Parabéns, nenhum erro encontrado!",
  },
  viewModeLabel: "Modo de visualização",
  viewMode: {
    form: "Formulário",
    oneNode: "Um nó",
  },
  code: {
    selectItem: "Selecionar item",
    selectItem_plural: "Selecionar itens",
  },
  coordinate: {
    accuracy: "Precisão (m)",
    altitude: "Altitude (m)",
    altitudeAccuracy: "Precisão da altitude (m)",
    angleToTargetLocation: "Ângulo para o alvo",
    confirmConvertCoordinate:
      "Converter coordenada de SRC {{srsFrom}} para SRC {{srsTo}}?",
    convert: "Converter",
    currentLocation: "Localização atual",
    distance: "Distância (m)",
    getLocation: "Obter localização",
    heading: "Direção (graus)",
    keepXAndY: "Manter X e Y",
    magnetometerNotAvailable: "Magnetômetro não disponível!",
    navigateToTarget: "Navegar para o alvo",
    srs: "$t(common:srs)",
    useCurrentLocation: "Usar localização atual",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Pesquisar táxon",
    taxonNotSelected: "--- Táxon não selecionado ---",
  },
  fileAttribute: {
    chooseAudio: "Escolher um arquivo de áudio",
    chooseFile: "Escolher um arquivo",
    choosePicture: "Escolher uma imagem",
    chooseVideo: "Escolher um vídeo",
    deleteConfirmMessage: "Excluir o arquivo existente?",
  },
  fileAttributeImage: {
    imagePreview: "Pré-visualização da imagem",
    pictureResizedToSize: "Imagem redimensionada para {{size}}",
    resolution: "Resolução",
  },
  dataExport: {
    error: "Erro ao exportar dados. Detalhes: {{details}}",
    selectTarget: "Selecionar destino de exportação",
    selectTargetMessage: "Selecione o destino da exportação:",
    target: {
      remote: "Servidor remoto",
      local: "Pasta local (Download)",
      share: "Compartilhar arquivo",
    },
    shareExportedFile: "Compartilhar arquivo exportado",
  },
  location: {
    gettingCurrentLocation: "Obtendo localização atual",
    usingCurrentLocation: "Usando localização atual",
  },
  unlock: {
    label: "Desbloquear",
    confirmMessage: "A edição do registro está bloqueada; desbloqueá-la?",
    confirmTitle: "Edição bloqueada",
  },
};
