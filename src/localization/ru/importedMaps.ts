export default {
  title: "PDF-карты",
  description:
    "Импортируйте карты из геопространственных (геопривязанных) PDF-файлов, сохранённых на этом устройстве: они отображаются поверх базовой карты на всех картах приложения, даже без подключения к интернету.",
  rendererNotAvailable:
    "Эта версия приложения не поддерживает PDF-карты: обновите приложение до последней версии",
  importPdf: "Импортировать PDF",
  noMaps: "PDF-карты ещё не импортированы",
  storage: {
    used: "Место, занятое PDF-картами:",
  },
  opacity: "Непрозрачность: {{value}}%",
  hideBaseMap: "Только PDF",
  map: {
    fileName: "Файл: {{fileName}}",
    page: "Страница: {{page}}",
    zoomLevels: "Уровни масштаба: {{minZoom}} - {{maxZoom}}",
    tiles: "Тайлы: {{count}}",
    size: "Размер: {{size}} (PDF-файл: {{sourceSize}})",
    datumWarning:
      "Датум карты не WGS84: карта может быть смещена на несколько метров",
    visible: "Показывать на картах",
    deleteConfirm: "Удалить PDF-карту '{{name}}'?",
    notFound: "PDF-карта не найдена",
    viewerTitle: "PDF-карта",
  },
  import: {
    title: "Импорт PDF-карты",
    analyzing: "Чтение геопривязки PDF-файла...",
    errorReading: "Ошибка чтения PDF-файла: {{details}}",
    notGeoreferenced:
      "PDF-файл не имеет геопривязки: он не содержит географических координат карты",
    unsupportedGeoreference:
      "Геопривязка этого PDF-файла (кодировка OGC GeoPDF) пока не поддерживается",
    page: "Страница",
    pageItem: "Страница {{page}}",
    name: "Название",
    maxZoom: "Макс. масштаб: {{value}}",
    nativeZoom: "(разрешение PDF: {{value}})",
    maxZoomAboveNative:
      "Уровни масштаба выше разрешения PDF будут выглядеть размытыми",
    estimate: "{{tiles}} тайлов · ~{{size}} (свободно: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} тайлов: слишком много (макс. {{maxTiles}}); уменьшите максимальный масштаб",
    tooManyTiles:
      "Слишком много тайлов: можно создать не более {{maxTiles}} тайлов; уменьшите максимальный масштаб",
    notEnoughSpace: "Недостаточно свободного места на устройстве",
    lowSpaceConfirm: {
      title: "Мало свободного места",
      message:
        "Карта займёт около {{size}}, {{percent}}% свободного места на устройстве ({{freeSpace}}). Продолжить?",
    },
    preview: {
      rendering: "Создание предпросмотра...",
      lowResolution:
        "Предпросмотр в низком разрешении (уровни масштаба {{minZoom}} - {{maxZoom}})",
      error: "Предпросмотр недоступен: {{details}}",
    },
    importButton: "Импортировать",
    jobTitle: "Импорт PDF-карты",
    complete: "PDF-карта импортирована ({{size}})",
    error: "Ошибка импорта PDF-карты: {{details}}",
  },
  validation: {
    nameRequired: "Название обязательно",
    nameDuplicate: "Название уже используется другой PDF-картой",
  },
};
