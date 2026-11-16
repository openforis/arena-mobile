export default {
  title: "نقشه‌های واردشده",
  description:
    "نقشه‌ها را از فایل‌های PDF یا GeoTIFF مکانی (زمین‌مرجع‌شده) ذخیره‌شده در این دستگاه وارد کنید: این نقشه‌ها در همه نقشه‌های برنامه روی نقشه پایه نمایش داده می‌شوند، حتی بدون اتصال به اینترنت.",
  rendererNotAvailable:
    "این نسخه از برنامه از نقشه‌های واردشده پشتیبانی نمی‌کند: آن را به آخرین نسخه به‌روزرسانی کنید",
  importMap: "وارد کردن نقشه",
  noMaps: "هنوز هیچ نقشه‌ای وارد نشده است",
  storage: {
    used: "فضای استفاده‌شده توسط نقشه‌های واردشده:",
  },
  opacity: "کدری: {{value}}%",
  hideBaseMap: "فقط نقشه واردشده",
  map: {
    fileName: "فایل: {{fileName}}",
    page: "صفحه: {{page}}",
    zoomLevels: "سطوح بزرگ‌نمایی: {{minZoom}} - {{maxZoom}}",
    tiles: "کاشی‌ها: {{count}}",
    size: "اندازه: {{size}} (فایل PDF: {{sourceSize}})",
    sizeTilesOnly: "اندازه: {{size}}",
    datumWarning: "دیتوم نقشه WGS84 نیست: ممکن است نقشه چند متر جابه‌جا باشد",
    visible: "نمایش روی نقشه‌ها",
    deleteConfirm: "نقشه '{{name}}' حذف شود؟",
    notFound: "نقشه یافت نشد",
    viewerTitle: "نقشه واردشده",
  },
  import: {
    title: "وارد کردن نقشه",
    analyzing: "در حال خواندن زمین‌مرجع فایل...",
    errorReading: "خطا در خواندن فایل: {{details}}",
    notGeoreferenced: "فایل زمین‌مرجع نشده است: مختصات جغرافیایی نقشه را ندارد",
    unsupportedGeoreference:
      "زمین‌مرجع این فایل PDF (رمزگذاری OGC GeoPDF) هنوز پشتیبانی نمی‌شود",
    unsupportedFile: "فایل از نوع PDF یا GeoTIFF نیست",
    unsupportedGeoTiffFormat:
      "تصاویر این فایل GeoTIFF پشتیبانی نمی‌شوند ({{details}}): فقط تصاویر با 8 بیت در هر نمونه (RGB، RGBA، خاکستری یا دارای پالت رنگ) قابل وارد کردن هستند",
    page: "صفحه",
    pageItem: "صفحه {{page}}",
    name: "نام",
    maxZoom: "حداکثر بزرگ‌نمایی: {{value}}",
    nativeZoom: "(وضوح نقشه: {{value}})",
    maxZoomAboveNative:
      "سطوح بزرگ‌نمایی بالاتر از وضوح نقشه تار به نظر می‌رسند",
    estimate: "{{tiles}} کاشی · حدود {{size}} (فضای خالی: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} کاشی: بیش از حد (حداکثر {{maxTiles}})؛ حداکثر بزرگ‌نمایی را کاهش دهید",
    tooManyTiles:
      "کاشی‌ها بیش از حد هستند: حداکثر {{maxTiles}} کاشی قابل ایجاد است؛ حداکثر بزرگ‌نمایی را کاهش دهید",
    notEnoughSpace: "فضای خالی کافی روی دستگاه وجود ندارد",
    lowSpaceConfirm: {
      title: "فضای خالی کم است",
      message:
        "نقشه حدود {{size}} یعنی {{percent}}% از فضای خالی دستگاه ({{freeSpace}}) را اشغال می‌کند. ادامه می‌دهید؟",
    },
    preview: {
      rendering: "در حال ایجاد پیش‌نمایش...",
      lowResolution:
        "پیش‌نمایش با وضوح پایین (سطوح بزرگ‌نمایی {{minZoom}} - {{maxZoom}})",
      error: "پیش‌نمایش در دسترس نیست: {{details}}",
    },
    importButton: "وارد کردن",
    jobTitle: "در حال وارد کردن نقشه",
    complete: "نقشه وارد شد ({{size}})",
    error: "خطا در وارد کردن نقشه: {{details}}",
  },
  validation: {
    nameRequired: "نام الزامی است",
    nameDuplicate: "این نام توسط نقشه واردشده دیگری استفاده شده است",
  },
};
