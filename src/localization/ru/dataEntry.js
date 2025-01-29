export default {
  confirmGoToListOfRecords:
    "Перейти к списку записей?\n\n(все изменения уже сохранены)",
  checkSyncStatus: "Проверить статус синхронизации",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Найти ближайшую точку сбора данных",
    findingClosestSamplingPoint: "Поиск ближайшей точки сбора данных",
    minDistanceItemFound: "Элемент найден на расстоянии {{minDistance}} м",
    minDistanceItemFound_plural:
      "Элементы найдены на расстоянии {{minDistance}} м",
    useSelectedItem: "Использовать выбранный элемент",
  },
  confirmDeleteSelectedItems: {
    message: "Удалить выбранные элементы?",
  },
  confirmDeleteValue: {
    message: "Удалить это значение?",
  },
  confirmOverwriteValue: {
    message: "Перезаписать существующее значение?",
  },
  cycle: "Цикл",
  cycleForNewRecords: "Цикл новых записей:",
  options: "Параметры",
  editNodeDef: "Редактировать {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Ошибка получения записей с сервера.\n\nПроверьте настройки соединения.\n\nПодробности: {{details}}",
  errorGeneratingRecordsExportFile:
    "Ошибка создания файла экспорта записей: {{details}}",
  errorLoadingRecords: "Ошибка загрузки записей: {{details}}",
  exportData: {
    title: "Экспорт данных",
    confirm: {
      title: "Подтвердить экспорт данных",
      message:
        "Записи для экспорта:\n- {{newRecordsCount}} новых записей;\n- {{updatedRecordsCount}} обновленных записей\n- {{conflictingRecordsCount}} конфликтующих записей",
    },
    noRecordsInDeviceToExport: "На устройстве нет записей для экспорта",
    onlyNewOrUpdatedRecords:
      "Экспортировать только новые или обновленные записи",
    mergeConflictingRecords:
      "Объединить конфликтующие записи (с одинаковыми ключами)",
    onlyRecordsInRemoteServerCanBeImported:
      "Могут быть импортированы только записи, находящиеся на удаленном сервере, или записи, обновленные удаленно",
  },
  exportNewOrUpdatedRecords: "Экспортировать новые или обновленные записи",
  formLanguage: "Язык формы:",
  noEntitiesDefined: "Элемент не определен",
  goToDataEntry: "Перейти к вводу данных",
  goToListOfRecords: "Перейти к списку записей",
  gpsLockingEnabledWarning: "Внимание: блокировка GPS включена!",
  listOfRecords: "Список записей",
  localBackup: "Локальная резервная копия",
  newRecord: "Новая",
  noRecordsFound: "Записи не найдены",
  recordEditor: "Редактор записей",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Показать значения из предыдущего цикла",
      message: "Выберите предыдущий цикл:",
      cycleItem: "Цикл {{cycleLabel}}",
    },
    foundMessage: "Запись в предыдущем цикле найдена!",
    notFoundMessage:
      "Запись в цикле {{cycle}} с ключами {{keyValues}} не найдена",
    confirmFetchRecordInCycle:
      "Запись в цикле {{cycle}} с ключами {{keyValues}} загружена не полностью; загрузить ее с сервера?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): получить список записей с сервера и попробовать снова?",
    fetchError: "Ошибка получения записи в предыдущем цикле: {{details}}",
    multipleRecordsFound:
      "Найдено несколько записей с ключами {{keyValues}} в цикле {{cycle}}",
    valuePanelHeader: "Значение в цикле {{prevCycle}}",
  },
  sendData: "Отправить данные",
  showOnlyLocalRecords: "Показать только локальные записи",
  syncedOn: "Синхронизировано",
  syncStatusHeader: "Статус",
  syncStatus: {
    conflictingKeys: "Запись с таким же ключом(ами) уже существует",
    keysNotSpecified: "Ключ(и) не указаны",
    new: "Новая (еще не загружена)",
    notModified: "Не изменена (нет изменений для загрузки)",
    modifiedLocally: "Изменена локально",
    modifiedRemotely: "Изменена на удаленном сервере",
    notInEntryStepAnymore:
      "Этап ввода завершен (запись на этапе очистки или анализа)",
  },
  validationReport: {
    title: "Отчет о проверке правильности",
    noErrorsFound: "Отлично, ошибок не найдено!",
  },
  viewModeLabel: "Режим просмотра",
  viewMode: {
    form: "Форма",
    oneNode: "Один узел",
  },
  code: {
    selectItem: "Выберите элемент",
    selectItem_plural: "Выберите элементы",
  },
  coordinate: {
    accuracy: "Точность (м)",
    altitude: "Высота (м)",
    altitudeAccuracy: "Точность высоты (м)",
    angleToTargetLocation: "Угол до цели",
    confirmConvertCoordinate:
      "Преобразовать координаты из SRS {{srsFrom}} в SRS {{srsTo}}?",
    convert: "Преобразовать",
    currentLocation: "Текущее местоположение",
    distance: "Расстояние (м)",
    getLocation: "Получить местоположение",
    heading: "Курс (град)",
    keepXAndY: "Сохранить X и Y",
    magnetometerNotAvailable: "Магнитометр недоступен!",
    navigateToTarget: "Перейти к местоположению",
    srs: "$t(common:srs)",
    useCurrentLocation: "Использовать текущее местоположение",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Поиск таксона",
    taxonNotSelected: "--- Таксон не выбран ---",
  },
  fileAttribute: {
    chooseAudio: "Выберите аудиофайл",
    chooseFile: "Выберите файл",
    choosePicture: "Выберите изображение",
    chooseVideo: "Выберите видеофайл",
    deleteConfirmMessage: "Удалить существующий файл?",
  },
  fileAttributeImage: {
    imagePreview: "Предпросмотр изображения",
    pictureResizedToSize: "Размер изображения изменен до {{size}}",
    resolution: "Разрешение",
  },
  dataExport: {
    error: "Ошибка экспорта данных. Подробности: {{details}}",
    selectTarget: "Выберите место назначения для экспорта",
    selectTargetMessage: "Выберите место назначения для экспорта:",
    target: {
      remote: "Удаленный сервер",
      local: "Локальная папка (Загрузка)",
      share: "Поделиться файлом",
    },
    shareExportedFile: "Поделиться экспортированным файлом",
  },
  location: {
    gettingCurrentLocation: "Получение текущего местоположения",
    usingCurrentLocation: "Использовать текущее местоположение",
  },
  unlock: {
    label: "Разблокировать",
    confirmMessage: "Редактирование записи заблокировано; разблокировать?",
    confirmTitle: "Редактирование заблокировано",
  },
};
