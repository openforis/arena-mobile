export default {
  title: "نقشه‌های PDF",
  description:
    "نقشه‌ها را از فایل‌های PDF مکانی (زمین‌مرجع‌شده) ذخیره‌شده در این دستگاه وارد کنید: این نقشه‌ها در همه نقشه‌های برنامه روی نقشه پایه نمایش داده می‌شوند، حتی بدون اتصال به اینترنت.",
  rendererNotAvailable:
    "این نسخه از برنامه از نقشه‌های PDF پشتیبانی نمی‌کند: آن را به آخرین نسخه به‌روزرسانی کنید",
  importPdf: "وارد کردن PDF",
  noMaps: "هنوز هیچ نقشه PDF وارد نشده است",
  storage: {
    used: "فضای استفاده‌شده توسط نقشه‌های PDF:",
  },
  opacity: "کدری: {{value}}%",
  hideBaseMap: "فقط PDF",
  map: {
    fileName: "فایل: {{fileName}}",
    page: "صفحه: {{page}}",
    zoomLevels: "سطوح بزرگ‌نمایی: {{minZoom}} - {{maxZoom}}",
    tiles: "کاشی‌ها: {{count}}",
    size: "اندازه: {{size}} (فایل PDF: {{sourceSize}})",
    datumWarning: "دیتوم نقشه WGS84 نیست: ممکن است نقشه چند متر جابه‌جا باشد",
    visible: "نمایش روی نقشه‌ها",
    deleteConfirm: "نقشه PDF '{{name}}' حذف شود؟",
    notFound: "نقشه PDF یافت نشد",
    viewerTitle: "نقشه PDF",
  },
  import: {
    title: "وارد کردن نقشه PDF",
    analyzing: "در حال خواندن زمین‌مرجع فایل PDF...",
    errorReading: "خطا در خواندن فایل PDF: {{details}}",
    notGeoreferenced:
      "فایل PDF زمین‌مرجع نشده است: مختصات جغرافیایی نقشه را ندارد",
    unsupportedGeoreference:
      "زمین‌مرجع این فایل PDF (رمزگذاری OGC GeoPDF) هنوز پشتیبانی نمی‌شود",
    page: "صفحه",
    pageItem: "صفحه {{page}}",
    name: "نام",
    maxZoom: "حداکثر بزرگ‌نمایی: {{value}}",
    nativeZoom: "(وضوح PDF: {{value}})",
    maxZoomAboveNative: "سطوح بزرگ‌نمایی بالاتر از وضوح PDF تار به نظر می‌رسند",
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
    jobTitle: "در حال وارد کردن نقشه PDF",
    complete: "نقشه PDF وارد شد ({{size}})",
    error: "خطا در وارد کردن نقشه PDF: {{details}}",
  },
  validation: {
    nameRequired: "نام الزامی است",
    nameDuplicate: "این نام توسط نقشه PDF دیگری استفاده شده است",
  },
};
