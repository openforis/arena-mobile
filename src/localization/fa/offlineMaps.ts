export default {
  title: "نقشه‌های آفلاین",
  description:
    "پیش از رفتن به میدان، نقشه منطقه مورد نظر خود را دانلود کنید: هنگام ترسیم یا مشاهده ویژگی‌های جغرافیایی، حتی بدون اتصال به اینترنت در دسترس خواهد بود.",
  freeLayersNotInUse:
    "نقشه‌های آفلاین فقط زمانی استفاده می‌شوند که ارائه‌دهنده نقشه در تنظیمات روی 'Free map layers' باشد.",
  useFreeLayers: "استفاده از لایه‌های نقشه رایگان",
  offlineMode: "آفلاین",
  addArea: "افزودن منطقه",
  deleteAll: "حذف همه",
  deleteAllConfirm:
    "همه مناطق نقشه آفلاین و همه کاشی‌های نقشه ذخیره‌شده در این دستگاه حذف شوند؟",
  clearCache: "پاک کردن حافظه پنهان نقشه",
  clearCacheConfirm:
    "همه کاشی‌های نقشه ذخیره‌شده در این دستگاه (کاشی‌هایی که هنگام مرور نقشه‌ها در حافظه پنهان ذخیره شده‌اند) حذف شوند؟",
  noAreas: "هنوز هیچ منطقه نقشه آفلاینی دانلود نشده است",
  storage: {
    used: "فضای استفاده‌شده توسط کاشی‌های نقشه (مناطق دانلودشده و حافظه پنهان):",
    free: "فضای خالی دستگاه:",
  },
  layers: {
    esriWorldImagery: "ماهواره‌ای (Esri World Imagery)",
    openTopoMap: "توپوگرافی (OpenTopoMap)",
    openStreetMap: "استاندارد (OpenStreetMap، فقط آنلاین)",
  },
  area: {
    surface: "مساحت: {{area}}",
    layer: "لایه: {{layer}}",
    zoomLevels: "سطوح بزرگ‌نمایی: {{minZoom}} - {{maxZoom}}",
    tiles: "کاشی‌ها: {{downloaded}} / {{total}}",
    size: "حجم: {{size}}",
    lastUpdate: "آخرین به‌روزرسانی: {{date}}",
    missingTiles: "کاشی‌های موجود نیست: {{count}}",
    resumeDownload: "دانلود موارد باقی‌مانده",
    deleteConfirm: "منطقه نقشه آفلاین '{{name}}' حذف شود؟",
    nameRequired: "نام الزامی است",
    nameDuplicate: "این نام قبلاً برای منطقه دیگری استفاده شده است",
  },
  areaEditor: {
    title: "منطقه نقشه آفلاین جدید",
    name: "نام",
    layer: "لایه",
    maxZoom: "حداکثر بزرگ‌نمایی: {{value}}",
    currentZoom: "بزرگ‌نمایی فعلی: {{value}}",
    surface: "مساحت: {{area}}",
    drawAreaToEstimate:
      "منطقه مورد نظر را روی نقشه ترسیم کنید تا فضایی که اشغال می‌کند را ببینید",
    estimate: "{{tiles}} کاشی · ~{{size}} (فضای خالی: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} کاشی: بیش از حد (حداکثر {{maxTiles}})؛ منطقه یا حداکثر بزرگ‌نمایی را کاهش دهید",
    tooManyTiles:
      "منطقه بیش از حد بزرگ است: حداکثر {{maxTiles}} کاشی قابل دانلود است؛ منطقه یا حداکثر بزرگ‌نمایی را کاهش دهید",
    notEnoughSpace: "فضای خالی کافی در دستگاه وجود ندارد",
  },
  areaViewer: {
    title: "منطقه نقشه آفلاین",
    notFound: "منطقه نقشه آفلاین یافت نشد",
  },
  download: {
    label: "دانلود",
    title: "در حال دانلود کاشی‌های نقشه",
    complete: "منطقه نقشه آفلاین دانلود شد ({{size}})",
    completeWithMissingTiles:
      "منطقه نقشه آفلاین دانلود شد ({{size}})؛ {{missingTiles}} کاشی دانلود نشد",
    error: "خطا در دانلود منطقه نقشه آفلاین: {{details}}",
  },
};
