import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Эта запись принадлежит другой группе пользователей: её можно только просматривать. Клонируйте её, чтобы редактировать",
  autoSync: {
    checkbox: "Автосинхронизация",
    synced: "Автоматически синхронизирована {{count}} запись",
    synced_other: "Автоматически синхронизировано {{count}} записей",
    synced_few: "Автоматически синхронизировано {{count}} записи",
    synced_many: "Автоматически синхронизировано {{count}} записей",
    statusLabel: "Статус синхронизации:",
    statusTitle: "Статус синхронизации",
    syncInProgressToast:
      "Выполняется автосинхронизация. Пожалуйста, дождитесь её завершения, прежде чем отправлять данные вручную.",
    batteryDataWarning:
      "Может увеличить расход батареи и мобильного трафика вне Wi-Fi",
    syncNow: "Синхронизировать сейчас",
    recordSyncInProgress:
      "Эта запись синхронизируется с сервером. Пожалуйста, подождите",
    status: {
      syncedTooltip: "Все записи синхронизированы с сервером",
      pendingTooltip:
        "Некоторые записи ещё нужно синхронизировать. Они будут отправлены автоматически",
      errorTooltip:
        "В некоторых записях есть ошибки синхронизации, требующие внимания. Откройте «Отправить данные», чтобы устранить их",
      needsManualFixTooltip:
        "Некоторые записи нельзя синхронизировать, пока вы их не исправите (например, не заполнены ключевые значения, те же ключи, что у записи на сервере, когда объединение запрещено, или запись больше не на этапе ввода). Проверьте их статус синхронизации в списке записей",
      mergeWithSameKeysNotAllowedNote:
        "У некоторых записей те же ключи, что и у записи, уже имеющейся на сервере, а объединение для этого обследования запрещено. Если это разные записи, измените их ключевые значения; если это одна и та же запись, обратитесь к администратору обследования.",
      syncingTooltip: "Синхронизация записей...",
      progressPercent: "{{progressPercent}}%",
      uncheckedTooltip:
        "Статус синхронизации ещё не проверен. Используйте «Проверить статус», чтобы проверить его",
      offlineTooltip:
        "Нет подключения к интернету. Автосинхронизация возобновится при восстановлении соединения",
      authErrorTooltip:
        "Срок действия сеанса с сервером истёк. Войдите снова, чтобы возобновить автосинхронизацию",
      checkErrorTooltip:
        "Не удалось проверить статус синхронизации из-за ошибки сервера. Повторите попытку",
      noCandidatesMessage: "Сейчас нечего отправлять",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Узлы больше не будут применяться",
    message: `Следующие узлы больше не будут применяться:  
  
{{attributeNames}}  
  
Их значения будут удалены.  
Продолжить?`,
  },
  checkStatus: "Проверить статус",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Найти ближайшую точку сбора данных",
    findingClosestSamplingPoint: "Поиск ближайшей точки сбора данных",
    minDistanceItemFound: "Элемент найден на расстоянии {{minDistance}} м",
    minDistanceItemFound_other:
      "Элементы найдены на расстоянии {{minDistance}} м",
    minDistanceItemFound_few:
      "Элементы найдены на расстоянии {{minDistance}} м",
    minDistanceItemFound_many:
      "Элементы найдены на расстоянии {{minDistance}} м",
    useSelectedItem: "Использовать выбранный элемент",
  },
  confirmDeleteSelectedItems: {
    message: "Удалить выбранные элементы?",
  },
  confirmDeleteValue: {
    message: "Удалить это значение?",
  },
  confirmGoToListOfRecords:
    "Перейти к списку записей?\n\n(все изменения уже сохранены)",
  confirmOverwriteValue: {
    message: "Перезаписать существующее значение?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Если вы продолжите, некоторые зависимые перечислимые сущности ({{entityDefs}}) будут перенумерованы, при этом существующие введенные в них значения (если таковые имеются) будут удалены.\n\nОбновить перечислимые сущности?",
    title: "Обновить перечислимые сущности",
  },
  createRecordError: "Ошибка при создании новой записи: {{error}}",
  userGroupNotReady: {
    title: "Информация о пользователе не готова",
    message: `Информация о вашей группе пользователей еще не получена с сервера. В этом опросе есть атрибуты, которые предварительно заполняются на основе вашей группы пользователей, поэтому создание записи сейчас может оставить их пустыми или неверными.

Хотите получить её снова с сервера?`,
    fetchAgain: "Получить снова",
    stillNotReady:
      "Не удалось получить информацию о вашей группе пользователей с сервера. Запись не создана.",
  },
  updateAttributeError: "Ошибка при обновлении значения: {{error}}",
  cycle: "Цикл",
  cycleForNewRecords: "Цикл новых записей:",
  options: "Параметры",
  editNodeDef: "Редактировать {{nodeDef}}",
  viewNodeDef: "Просмотр {{nodeDef}}",
  errorFetchingRecordsSyncStatus:
    "Ошибка получения записей с сервера.\n\nПроверьте настройки соединения.\n\nПодробности: {{details}}",
  errorGeneratingRecordsExportFile:
    "Ошибка создания файла экспорта записей: {{details}}",
  errorLoadingRecords: "Ошибка загрузки записей: {{details}}",
  exportNewOrUpdatedRecords: "Экспортировать новые или обновленные записи",
  formLanguage: "Язык формы:",
  entityListColumns: {
    button: "Столбцы",
    hideAll: "Скрыть все",
    keys: "Ключевые атрибуты",
    other: "Другие атрибуты",
    reset: "По умолчанию",
    showAll: "Показать все",
    summary: "Атрибуты сводки",
    title: "Видимые столбцы",
  },
  noEntitiesDefined: "Элемент не определен",
  goToDataEntry: "Перейти к вводу данных",
  goToListOfRecords: "К списку записей",
  gpsLockingEnabledWarning: "Внимание: блокировка GPS включена!",
  listOfRecords: "Список записей",
  localBackup: "Локальная резервная копия",
  newRecord: "Новая запись",
  newRecordShort: "Новая",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Невозможно добавить больше элементов: достигнуто максимальное количество",
    },
    cannotDeleteNode: {
      noNodeFound: "Невозможно удалить узел: узел не найден",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Невозможно обновить значение: узел не найден",
    },
  },
  noRecordsFound: "Записи не найдены",
  recordEditor: "Редактор записей",
  recordCompletion: {
    shortDescription: "Заполнено {{percent}}%",
  },
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
  recordStatus: {
    new: "новый",
    updated: "обновлено",
    conflicting: "противоречивый",
    conflictingModifiedRemotely: "изменено на устройстве и на сервере",
    withValidationErrors: "с ошибками валидации",
  },
  sendData: "Отправить данные",
  showOnlyLocalRecords: "Показать только локальные записи",
  syncedOn: "Синхронизировано",
  syncStatusHeader: "Статус",
  syncStatus: {
    conflictingKeys: "Запись с таким же ключом(ами) уже существует",
    deviceDateBehindServer:
      "Не загружено: дата на устройстве отстаёт от даты на сервере (установите правильные дату и время, затем снова отредактируйте запись)",
    keysNotSpecified: "Ключ(и) не указаны",
    new: "Новая (еще не загружена)",
    notModified: "Не изменена (нет изменений для загрузки)",
    modifiedLocally: "Изменена локально",
    modifiedLocallyAndRemotely:
      "Изменена локально и на удаленном сервере (конфликт)",
    modifiedRemotely: "Изменена на удаленном сервере",
    notInEntryStepAnymore:
      "Этап ввода завершен (запись на этапе очистки или анализа)",
  },
  processingData: {
    title: "Обработка данных",
  },
  uploadingData: {
    title: "Загрузка данных",
    size: "Размер файла: {{size}}",
    speed: "Скорость загрузки: {{speed}}/с",
    eta: "Осталось примерно: {{eta}}",
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
    selectItem_other: "Выберите элементы",
    selectItem_few: "Выберите элементы",
    selectItem_many: "Выберите элементы",
  },
  coordinate: {
    longPressMarkerToMove:
      "Нажмите и удерживайте маркер, чтобы переместить его",
    saveNewPosition: "Сохранить новую позицию",
    accuracy: "Точность (м)",
    altitude: "Высота (м)",
    altitudeAccuracy: "Точность высоты (м)",
    angleToTargetLocation: "Угол до цели",
    confirmConvertCoordinate:
      "Преобразовать координаты из SRS {{srsFrom}} в SRS {{srsTo}}?",
    connectingToSource: "Подключение к {{label}}...",
    convert: "Преобразовать",
    currentLocation: "Текущее местоположение",
    distance: "Расстояние (м)",
    externalGpsGenericLabel: "внешнее устройство GPS",
    getLocation: "Получить местоположение",
    heading: "Курс (град)",
    map: {
      attributeViewerTitle: "Местоположение «{{attributeLabel}}»",
      chooserTitle: "Показать на карте",
      inApp: "Arena Mobile",
      inAppDescription: "Работает офлайн со скачанными картами",
      inAppDescriptionRelocatable:
        "Работает офлайн со скачанными картами.\nПоложение можно изменить",
      otherApp: "Другое приложение…",
      otherAppDescription:
        "Выбрать среди всех установленных приложений, которые могут показать местоположение",
      show: "Показать",
      targetViewerTitle: "Целевое местоположение «{{attributeLabel}}»",
      viewerTitle: "Местоположение",
    },
    headingOffset: "Отклонение курса",
    headingSource: "Источник курса",
    headingSourceMagnetometer: "Датчик",
    headingSourceLocation: "GPS",
    keepXAndY: "Сохранить X и Y",
    locationHeadingNotAvailable: "Курс по GPS недоступен!",
    magnetometerNotAvailable: "Магнитометр недоступен!",
    navigateToTarget: "Перейти к местоположению",
    srs: "$t(common:srs)",
    targetLocation: "Целевое местоположение",
    useCurrentLocation: "Использовать текущее местоположение",
    usingInternalFallback: "Используется внутренний GPS ({{label}} недоступен)",
    usingSource: "Используется {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Компас",
    viewModeRadar: "Радар",
    locationNavigatorInfo: {
      title: "Навигатор по местоположению",
      description:
        "Ведёт вас к целевой координате с помощью GPS и датчиков вашего устройства. Показывает целевое местоположение относительно вашей текущей позиции и позволяет дойти до него в поле.",
      viewModesTitle: "Режимы просмотра",
      compassTitle: "Компас",
      compassDesc:
        "Отображает вращающуюся розу ветров, ориентированную на север. Стрелка указывает направление на цель. Когда цель совсем близко (режим приближения), стрелка заменяется точкой на круге точности, показывающей относительное положение цели.",
      radarTitle: "Радар",
      radarDesc:
        "Показывает вид радара сверху, где ваша позиция зафиксирована в центре. Точка цели перемещается вокруг вас в реальном времени, отражая её фактическое направление и расстояние.",
      headingSourcesTitle: "Источники направления",
      sensorTitle: "Датчик (магнитометр)",
      sensorDesc:
        "Использует встроенный магнитометр устройства (чип компаса). Работает, когда вы стоите на месте, но на него могут влиять находящиеся рядом металлические предметы или магнитные помехи.",
      gpsTitle: "GPS",
      gpsDesc:
        "Определяет направление по перемещению по GPS. Точнее на открытой местности, но требует, чтобы вы шли, и может быть доступно не на всех устройствах.",
    },
  },
  geo: {
    drawPolygon: "Нарисовать полигон",
    editPolygon: "Редактировать полигон",
    selectPolygonInstruction: "Нажмите на полигон, чтобы выбрать его",
    selectPointInstructions: `- Нажмите на точку, чтобы выбрать её.  
- Нажмите на среднюю точку, чтобы добавить новую точку.`,
    editPolygonInstructions:
      "Нажмите и удерживайте выбранную точку, затем перетащите её, чтобы переместить.",
    tapToAddPoints: `Нажмите на карту, чтобы добавить точки.  
Нажмите '$t(common:stop)', когда закончите.`,
    deleteSelectedPoint: "Удалить выбранную точку",
    addCurrentLocationPoint: "Добавить текущее местоположение",
    addCurrentLocationPointInstructions:
      "Нажмите '$t(dataEntry:geo.addCurrentLocationPoint)', чтобы добавить текущее местоположение в полигон",
  },
  positionTracking: {
    title: "Отслеживание местоположения",
    start: "Начать отслеживание",
    resume: "Продолжить",
    restart: "Начать заново",
    restartConfirm: {
      title: "Удалить записанный трек?",
      message:
        "Все точки, записанные до сих пор в этом атрибуте, будут удалены, и отслеживание начнётся с нуля. Это действие нельзя отменить.",
    },
    delete: "Удалить трек",
    deleteConfirm: {
      title: "Удалить записанный трек?",
      message:
        "Все точки, записанные в этом атрибуте, будут удалены, и атрибут останется пустым. Это действие нельзя отменить.",
    },
    stop: "Остановить",
    showTrack: "Показать трек",
    retry: "Повторить",
    status: {
      idle: "Отслеживание не ведётся",
      stopped: "Отслеживание остановлено",
      starting: "Запуск отслеживания…",
      tracking: "Идёт отслеживание",
      paused: "Отслеживание приостановлено",
    },
    waitingForFix: "Ожидание GPS…",
    accuracy: "±{{accuracy}} м",
    pointsCount: "{{count}} точка",
    pointsCount_few: "{{count}} точки",
    pointsCount_many: "{{count}} точек",
    pointsCount_other: "{{count}} точки",
    trackSummary: "{{length}} · точек: {{pointsCount}} · {{duration}}",
    attributeNotEditable:
      "Значение этого атрибута записывается отслеживанием местоположения",
    stopConfirm:
      "Остановить отслеживание? Записанный трек сохраняется в атрибуте, и его можно будет продолжить позже.",
    stopCurrentConfirm:
      "Сейчас отслеживается другой атрибут: остановить его отслеживание и начать отслеживание этого?",
    interrupted:
      "Отслеживание местоположения было прервано: записанный трек сохранён. Продолжите отслеживание, чтобы продолжить запись.",
    error: {
      generic: "Невозможно запустить отслеживание местоположения",
      permissionDenied:
        "Невозможно отслеживать местоположение: доступ к местоположению не предоставлен",
      locationServicesOff:
        "Невозможно отслеживать местоположение: службы геолокации отключены",
      notSaved:
        "Трек пока не удалось сохранить в атрибуте: он будет сохранён позже",
    },
  },
  taxon: {
    search: "Поиск таксона",
    taxonNotSelected: "--- Таксон не выбран ---",
  },
  fileAttribute: {
    selectAudio: "Выберите аудио",
    selectFile: "Выберите файл",
    selectPicture: "Выберите изображение",
    selectVideo: "Выберите видео",
    deleteConfirmMessage: "Удалить существующий файл?",
    fileMissing: "Файл не найден в локальном хранилище",
    fileSelectError: "Ошибка при выборе файла: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Ошибка при запуске записи аудио: {{error}}",
      pausingRecording: "Ошибка при паузе записи аудио: {{error}}",
      resumingRecording: "Ошибка при возобновлении записи аудио: {{error}}",
      savingRecording: "Ошибка при сохранении записи аудио",
      stoppingRecording: "Ошибка при остановке записи аудио: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Просмотр",
    pictureResizedToSize: `Размер изображения изменен до {{size}}.
Максимально допустимый размер: {{maxSizeMB}}МБ.
Проверьте настройки или попросите администратора опроса изменить это ограничение.`,
    resolution: "Разрешение",
    rotate: "Повернуть",
    cameraOpenError: "Ошибка при открытии камеры: {{error}}",
    rotationError: "Ошибка при повороте изображения: {{error}}",
  },
  dataExport: {
    confirm: {
      title: "Подтвердить экспорт данных",
      message: `Записи для экспорта:
{{recordsCountSummary}}`,
      selectOptions: `Выберите параметры экспорта:`,
    },

    error: "Ошибка экспорта данных. Подробности: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Данные успешно экспортированы, но {{missingFiles}} файлов/изображений отсутствуют или повреждены. Пожалуйста, проверьте свои записи, а также записи на сервере.",
    exportingData: "Экспорт данных...",
    exportToCsv: "Экспортировать в CSV",
    mergeConflictingRecords: "Объединить конфликтующие записи",
    mergeWithSameKeysNotAllowed:
      "Объединение записей с одинаковыми ключами для этого обследования запрещено, поэтому записи с конфликтующими ключами не будут отправлены. Если это разные записи, измените их ключевые значения; если это одна и та же запись, обратитесь к администратору обследования.",
    mergeSameRecordConflictConfirm: {
      title: "Объединить записи, изменённые на обоих устройствах",
      message: `{{count}} запис(ь/и/ей) также были изменены на сервере с момента последней синхронизации этого устройства.

При объединении ваши изменения будут объединены с изменениями сервера: для каждого поля будет сохранено последнее отредактированное значение, а любые новые разделы, добавленные на любом из устройств, будут сохранены.

Предварительный просмотр невозможен. Проведите пальцем, чтобы подтвердить и продолжить.`,
    },
    noRecordsInDeviceToExport: "На устройстве нет записей для экспорта",
    onlyNewOrUpdatedRecords:
      "Экспортировать только новые или обновленные записи",
    recordsMergedMessage: `Следующие записи были объединены с более новой версией, уже существующей на сервере:
{{recordsList}}

Объединённая версия этих записей была загружена автоматически.`,
    onlyRecordsInRemoteServerCanBeImported:
      "Могут быть импортированы только записи, находящиеся на удаленном сервере, или записи, обновленные удаленно",
    option: {
      [FlatDataExportOption.addCycle]: "Добавить цикл",
      [FlatDataExportOption.includeAncestorAttributes]: "Атрибуты предков",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Метки элементов категории",
      [FlatDataExportOption.includeFiles]: "Атрибуты файлов",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Научное название таксона",
    },
    selectTarget: "Выберите место назначения для экспорта",
    selectTargetMessage: "Выберите место назначения для экспорта:",
    shareExportedFile: "Поделиться экспортированным файлом",
    target: {
      remote: "Удаленный сервер",
      local: "Локальная папка (Загрузка)",
      share: "$t(common:shareFile)",
    },
    recordsWithMissingFilesConfirm: {
      confirmButton: "Экспортировать без отсутствующих файлов",
      title: "Отсутствующие файлы",
      message: `Следующие записи имеют отсутствующие файлы и будут экспортированы без них:\n{{recordsList}}\n\nВы хотите продолжить?`,
    },
    title: "Экспорт данных",
  },
  location: {
    label: "Местоположение",
    gettingCurrentLocation: "Получение текущего местоположения",
    usingCurrentLocation: "Использовать текущее местоположение",
  },
  unlock: {
    label: "Разблокировать",
    confirmMessage: "Редактирование записи заблокировано; разблокировать?",
    confirmTitle: "Редактирование заблокировано",
  },
};
