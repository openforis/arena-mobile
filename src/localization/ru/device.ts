export default {
  battery: {
    title: "Батарея",
    level: "Уровень заряда батареи",
    statusLabel: "Состояние батареи",
    status: {
      charging: "Зарядка",
      unplugged: "Нет подключения к сети",
    },
    timeLeftToDischarge: "Время до разрядки",
    timeLeftToFullCharge: "Время до полной зарядки",
  },
  internalMemory: {
    title: "Внутренняя память",
    storageAvailable: "Доступно памяти",
    recordFilesSize: "Размер файлов записи",
    tempFilesSize: "Размер временных файлов",
  },
  locationServiceDisabled: {
    warning:
      "Служба определения местоположения отключена; пожалуйста, включите ее в настройках устройства.",
  },
  externalGps: {
    unavailable: {
      warning:
        "Внешнее устройство GPS недоступно; для этого сеанса используется встроенный GPS.",
    },
  },
  network: {
    title: "Сеть",
    statusLabel: "Состояние сети",
    status: {
      connected: "Подключено",
      offline: "Оффлайн",
    },
  },
};
