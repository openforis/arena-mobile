export default {
  title: "Настройки",
  animationsEnabled: "Анимации включены",
  connectionToServer: "Подключение к серверу",
  fontScale: "Размер шрифта: {{value}}",
  keepScreenAwake: "Не выключать экран",
  fullScreen: "Полный экран",
  imageSizeLimit: "Размер изображений ограничен: {{value}}MB",
  imageSizeUnlimited: {
    label: "Размер изображений не ограничен",
    description:
      "Изображения будут храниться в максимальном разрешении, предоставляемом устройством, если только не установлено ограничение в конструкторе формы опроса.",
  },
  language: {
    label: "Язык приложения",
  },
  locationAccuracyThreshold:
    "Порог точности определения местоположения (в метрах)",
  locationAccuracyWatchTimeout:
    "Время ожидания определения точности местоположения: {{value}} секунд",
  locationAveragingEnabled: {
    label: "Усреднение местоположения включено",
    description:
      "Если включено, записанное местоположение будет средним значением нескольких измерений местоположения, что повысит точность",
  },
  locationGpsLocked: {
    label: "GPS заблокирован",
    description:
      "Внимание: расход заряда батареи увеличится!\nСигнал GPS будет заблокирован во время работы приложения.\nЭто позволит получить более точные координаты.",
    error:
      "Невозможно запустить блокировку GPS: приемник GPS недоступен или доступ к местоположению не предоставлен",
  },
  gpsDevicePairing: {
    title: "Подключить GPS-устройство",
    scanButton: "Поиск устройств",
    scanningLabel: "Поиск устройств поблизости…",
    scanAgainButton: "Повторить поиск",
    emptyResult:
      "Устройства не найдены. Убедитесь, что ваш GPS-приемник включен и находится в режиме сопряжения.",
    scanFailed: "Во время поиска произошла ошибка. Попробуйте снова.",
    recognizedDevicesNotice:
      "Отображаются только устройства, распознанные как GPS-приемники.",
    pairedDevicesTitle: "Сопряженные устройства",
    newDevicesTitle: "Новые устройства",
    pairButton: "Подключить",
    pairing: "Подключение…",
    pairingSucceeded: "Подключено к {{name}}",
    pairingFailed: "Не удалось подключиться к {{name}}",
    bluetoothDisabled: "Bluetooth выключен.",
    enableBluetoothButton: "Включить Bluetooth",
    permissionDenied: "Для поиска устройств требуется разрешение Bluetooth.",
    openSettingsButton: "Открыть настройки приложения",
  },
  preferredGpsSourceId: {
    label: "Источник GPS",
    description:
      "Выберите, какой GPS использовать для записи координат: встроенный GPS телефона или подключенный внешний GPS-приемник (например, Bad Elf).",
    auto: "Авто (внешний, если доступен)",
    internal: "Встроенный GPS",
    pairNewDevice: "Подключить новое устройство…",
  },
  showStatusBar: "Показать строку состояния",
  theme: {
    label: "Тема",
    auto: "Автомат",
    dark: "Темная",
    dark2: "Темная 2",
    light: "Светлая",
    light2: "Светлая 2",
  },
};
