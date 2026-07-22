export default {
  title: "تنظیمات",
  animationsEnabled: "انیمیشن ها فعال",
  connectionToServer: "اتصال به سرور",
  fontScale: "مقیاس فونت: {{value}}",
  keepScreenAwake: "روشن نگه داشتن صفحه",
  fullScreen: "تمام صفحه",
  imageSizeLimit: "حجم تصاویر محدود به: {{value}}MB",
  imageSizeUnlimited: {
    label: "حجم تصاویر نامحدود",
    description:
      "تصاویر با حداکثر وضوح ارائه شده توسط دستگاه ذخیره خواهند شد، مگر اینکه محدودیتی در طراح فرم نظرسنجی تعیین شده باشد.",
  },
  language: {
    label: "زبان برنامه",
  },
  locationAccuracyThreshold: "آستانه دقت موقعیت مکانی (متر)",
  locationAccuracyWatchTimeout: "زمان انتظار دقت موقعیت مکانی: {{value}} ثانیه",
  locationAveragingEnabled: {
    label: "میانگین گیری موقعیت مکانی فعال",
    description:
      "هنگامی که فعال باشد، موقعیت مکانی ثبت شده میانگین چندین خوانش موقعیت مکانی خواهد بود که دقت را بهبود می بخشد",
  },
  locationGpsLocked: {
    label: "GPS قفل شده",
    description: `هشدار: مصرف باتری افزایش می یابد!
  سیگنال GPS هنگام اجرای برنامه قفل خواهد شد.
  این به دستیابی به دقت بهتر در ویژگی های مختصات کمک می کند.`,
    error:
      "امکان شروع قفل GPS وجود ندارد: ارائه دهنده موقعیت مکانی در دسترس نیست یا دسترسی به موقعیت مکانی روشن نشده است",
  },
  gpsDevicePairing: {
    title: "جفت کردن یک دستگاه GPS",
    scanButton: "جستجوی دستگاه‌ها",
    scanningLabel: "در حال جستجوی دستگاه‌های اطراف…",
    scanAgainButton: "جستجوی دوباره",
    emptyResult:
      "هیچ دستگاهی یافت نشد. مطمئن شوید گیرنده GPS شما روشن و در حالت جفت‌سازی است.",
    scanFailed: "هنگام جستجو مشکلی پیش آمد. لطفاً دوباره امتحان کنید.",
    showAllDevices: "نمایش همه دستگاه‌های اطراف",
    pairButton: "جفت کردن",
    pairing: "در حال جفت کردن…",
    pairingSucceeded: "با {{name}} جفت شد",
    pairingFailed: "جفت کردن با {{name}} ممکن نشد",
    bluetoothDisabled: "بلوتوث خاموش است.",
    enableBluetoothButton: "روشن کردن بلوتوث",
    permissionDenied: "برای جستجوی دستگاه‌ها به مجوز بلوتوث نیاز است.",
    openSettingsButton: "باز کردن تنظیمات برنامه",
  },
  preferredGpsSourceId: {
    label: "منبع GPS",
    description:
      "انتخاب کنید کدام GPS برای ثبت مختصات استفاده شود: GPS داخلی گوشی یا گیرنده GPS خارجی جفت‌شده (مثلاً Bad Elf).",
    auto: "خودکار (خارجی در صورت وجود)",
    internal: "GPS داخلی",
    pairNewDevice: "جفت کردن دستگاه جدید…",
  },
  showStatusBar: "نمایش نوار وضعیت",
  theme: {
    label: "انتخاب تم",
    auto: "انتخاب خودکار",
    dark: "تم تیره",
    dark2: "2 تم تیره",
    light: "تم روشن",
    light2: "2 تم روشن",
  },
};
