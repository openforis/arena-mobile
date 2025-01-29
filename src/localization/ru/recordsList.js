export default {
  cloneRecords: {
    title: "Клонировать",
    confirm: {
      message:
        "Клонировать выбранные {{recordsCount}} записи в цикл {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Только записи, загруженные на устройство или измененные локально, могут быть клонированы в следующий цикл",
    completeSuccessfully: "Записи успешно клонированы в цикл {{cycle}}!",
  },
  confirmImportRecordFromServer: "Загрузать запись с сервера?",
  dateModifiedRemotely: "Дата изменения на удаленном сервере",
  deleteRecordsConfirm: {
    title: "Удалить записи",
    message: "Удалить выбранные записи?",
  },
  duplicateKey: {
    title: "Дубликат ключа",
    message: "Другая запись с таким же ключом ({{keyValues}}) уже существует.",
  },
  exportRecords: {
    title: "Экспорт",
  },
  importRecord: "Загрузить запись",
  importRecords: {
    title: "Загрузка с сервера",
  },
  importRecordsFromFile: {
    title: "Загрузка",
    confirmMessage: "Загрузить записи из выбранного файла\n{{fileName}}?",
    invalidFileType: "Неверный тип файла (ожидается .zip)",
    overwriteExistingRecords: "Перезаписать существующие записи",
    selectFile: "Выберите файл",
  },
  importCompleteSuccessfully:
    "Загрузка записей успешно завершена!\n- Обработано {{processedRecords}} записей\n- Добавлено {{insertedRecords}} записей\n- Обновлено {{updatedRecords}} записей",
  importFailed: "Ошибка загрузки записей: {{details}}",
  loadStatus: {
    title: "Загружено",
    C: "Полностью",
    P: "Частично (без файлов)",
    S: "Только сводка",
  },
  origin: {
    title: "Источник",
    L: "Локальный",
    R: "Удаленный",
  },
  owner: "Владелец",
};
