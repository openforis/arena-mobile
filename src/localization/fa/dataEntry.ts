import { DataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords: `به لیست رکوردها بروید؟
  
  (همه تغییرات قبلاً ذخیره شده اند)`,
  checkStatus: "بررسی وضعیت همگام سازی",
  closestSamplingPoint: {
    findClosestSamplingPoint: "یافتن نزدیکترین نقطه نمونه برداری",
    findingClosestSamplingPoint: "در حال یافتن نزدیکترین نقطه نمونه برداری",
    minDistanceItemFound: "موردی در فاصله {{minDistance}} متر یافت شد",
    minDistanceItemFound_plural: "مواردی در فاصله {{minDistance}} متر یافت شد",
    useSelectedItem: "استفاده از مورد انتخاب شده",
  },
  confirmDeleteSelectedItems: {
    message: "آیا از حذف موارد انتخاب شده مطمئن هستید؟",
  },
  confirmDeleteValue: {
    message: "آیا از حذف این مقدار مطمئن هستید؟",
  },
  confirmOverwriteValue: {
    message: "آیا از بازنویسی مقدار موجود مطمئن هستید؟",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "اگر ادامه دهید، برخی از موجودیت‌های شمارشی وابسته ({{entityDefs}}) دوباره شمارش می‌شوند و مقادیر موجود وارد شده در آن‌ها (در صورت وجود) حذف می‌شوند.\n\nآیا موجودیت‌های شمارشی را به‌روزرسانی می‌کنید؟",
    title: "به‌روزرسانی موجودیت‌های شمارشی",
  },
  cycle: "چرخه",
  cycleForNewRecords: "چرخه برای رکوردهای جدید:",
  options: "گزینه ها",
  editNodeDef: "ویرایش {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `خطا در دریافت رکوردها از سرور.
  
  تنظیمات اتصال را بررسی کنید.
  
  جزئیات: {{details}}`,
  errorGeneratingRecordsExportFile:
    "خطا در ایجاد فایل اکسپورت رکوردها: {{details}}",
  errorLoadingRecords: "خطا در بارگذاری رکوردها: {{details}}",
  exportNewOrUpdatedRecords: "اکسپورت رکوردهای جدید یا به روز شده",
  formLanguage: "زبان فرم:",
  noEntitiesDefined: "هیچ موجودیتی تعریف نشده است",
  goToDataEntry: "رفتن به وارد کردن داده",
  goToListOfRecords: "رفتن به لیست رکوردها",
  gpsLockingEnabledWarning: "هشدار: قفل GPS فعال است!",
  listOfRecords: "رکوردها",
  localBackup: "پشتیبان گیری محلی",
  newRecord: "جدید",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "امکان افزودن موارد بیشتر وجود ندارد: حداکثر تعداد مجاز رسیده است",
    },
  },
  noRecordsFound: "رکوردی یافت نشد",
  recordEditor: "ویرایشگر رکورد",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "نمایش مقادیر از چرخه قبلی",
      message: "چرخه قبلی را انتخاب کنید:",
      cycleItem: "چرخه {{cycleLabel}}",
    },
    foundMessage: "رکورد در چرخه قبلی یافت شد!",
    notFoundMessage:
      "رکوردی در چرخه {{cycle}} با کلیدهای {{keyValues}} یافت نشد",
    confirmFetchRecordInCycle:
      "رکورد در چرخه {{cycle}} با کلیدهای {{keyValues}} به طور کامل بارگیری نشده است؛ می خواهید از سرور دانلود کنید؟",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): لیست رکوردها را از سرور دریافت کرده و دوباره امتحان کنید؟",
    fetchError: "خطا در دریافت رکورد در چرخه قبلی: {{details}}",
    multipleRecordsFound:
      "چندین رکورد با کلیدهای {{keyValues}} در چرخه {{cycle}} یافت شد",

    valuePanelHeader: "مقدار در چرخه {{prevCycle}}",
  },
  recordStatus: {
    new: "جدید",
    updated: "به‌روز‌شده",
    conflicting: "متعارض",
    withValidationErrors: "با خطاهای اعتبارسنجی",
  },
  sendData: "ارسال داده",
  showOnlyLocalRecords: "فقط رکوردهای محلی را نشان دهید",
  syncedOn: "همگام سازی شده در",
  syncStatusHeader: "وضعیت",
  syncStatus: {
    conflictingKeys: "رکوردی با همان کلید(ها) از قبل وجود دارد",
    keysNotSpecified: `کلید(ها) مشخص نشده اند`,
    new: "جدید (هنوز آپلود نشده)",
    notModified: "تغییر نکرده (هیچ تغییری برای آپلود وجود ندارد)",
    modifiedLocally: "در دستگاه تغییر کرده است",
    modifiedRemotely: "در سرور تغییر کرده است",
    notInEntryStepAnymore:
      "دیگر در مرحله ورود نیست (در مرحله پاکسازی یا تجزیه و تحلیل است)",
  },
  uploadingData: {
    title: "در حال بارگذاری داده",
  },
  validationReport: {
    title: "گزارش اعتبارسنجی",
    noErrorsFound: "تبریک، خطایی یافت نشد!",
  },

  viewModeLabel: "حالت مشاهده",
  viewMode: {
    form: "فرم",
    oneNode: "یک گره",
  },

  code: {
    selectItem: "انتخاب مورد",
    selectItem_plural: "انتخاب موارد",
  },
  coordinate: {
    accuracy: "دقت (متر)",
    altitude: "ارتفاع (متر)",
    altitudeAccuracy: "دقت ارتفاع (متر)",
    angleToTargetLocation: "زاویه دید روی",
    confirmConvertCoordinate:
      "آیا از تبدیل مختصات از SRS {{srsFrom}} به SRS {{srsTo}} مطمئن هستید؟",
    convert: "تبدیل",
    currentLocation: "موقعیت فعلی",
    distance: "فاصله (متر)",
    getLocation: "دریافت موقعیت مکانی",
    heading: "جهت (درجه)",
    keepXAndY: "نگه داشتن X و Y",
    magnetometerNotAvailable: "مگنتومتر در دسترس نیست!",
    navigateToTarget: "هدایت به هدف",
    srs: "$t(common:srs)",
    useCurrentLocation: "استفاده از موقعیت فعلی",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "جستجوی تاکسون",
    taxonNotSelected: "--- تاکسون انتخاب نشده است ---",
  },
  fileAttribute: {
    chooseAudio: "انتخاب فایل صوتی",
    chooseFile: "انتخاب فایل",
    choosePicture: "انتخاب تصویر",
    chooseVideo: "انتخاب ویدیو",
    deleteConfirmMessage: "آیا از حذف فایل موجود مطمئن هستید؟",
  },
  fileAttributeImage: {
    imagePreview: "پیش نمایش تصویر",
    pictureResizedToSize: `اندازه تصویر به {{size}} تغییر یافت.
حداکثر اندازه مجاز: {{maxSizeMB}} مگابایت.
تنظیمات را بررسی کنید یا از مدیر نظرسنجی بخواهید این محدودیت را تغییر دهد.`,
    resolution: "رزولوشن",
  },
  dataExport: {
    confirm: {
      title: "تایید اکسپورت داده ها",
      message: `رکوردهای قابل اکسپورت:
{{recordsCountSummary}}`,
      selectOptions: `گزینه‌های اکسپورت را انتخاب کنید:`,
    },

    error: "خطا در اکسپورت داده ها. جزئیات: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "داده‌ها با موفقیت صادر شدند اما {{missingFiles}} فایل/تصویر گم شده یا خراب است. لطفاً سوابق خود و همچنین سوابق روی سرور را بررسی کنید.",
    exportingData: "در حال اکسپورت داده ها...",
    exportToCsv: "اکسپورت به CSV",
    mergeConflictingRecords: "ادغام رکوردهای متناقض (کلیدهای یکسان)",
    noRecordsInDeviceToExport: "هیچ رکوردی در دستگاه برای اکسپورت وجود ندارد",
    onlyNewOrUpdatedRecords: "فقط رکوردهای جدید یا به روز شده را اکسپورت کنید",
    onlyRecordsInRemoteServerCanBeImported:
      "فقط رکوردهایی که قبلاً در سرور از راه دور وجود دارند یا رکوردهایی که از راه دور به روز شده اند قابل وارد کردن هستند",
    option: {
      [DataExportOption.addCycle]: "افزودن چرخه",
      [DataExportOption.includeAncestorAttributes]: "ویژگی‌های اجدادی",
      [DataExportOption.includeCategoryItemsLabels]:
        "برچسب‌های موارد دسته‌بندی",
      [DataExportOption.includeFileAttributeDefs]: "تعریف‌های ویژگی فایل",
      [DataExportOption.includeTaxonScientificName]: "نام علمی طبقه‌بندی",
    },
    selectTarget: "انتخاب  روش اکسپورت",
    selectTargetMessage: `روش اکسپورت را انتخاب کنید:`,
    shareExportedFile: "اشتراک گذاری فایل اکسپورت شده",
    target: {
      remote: "سرور راه دور",
      local: "پوشه محلی (دانلود)",
      share: "$t(common:shareFile)",
    },
    title: "اکسپورت داده ها",
  },
  location: {
    label: "مکان",
    gettingCurrentLocation: "در حال دریافت موقعیت فعلی",
    usingCurrentLocation: "استفاده از موقعیت فعلی",
  },
  unlock: {
    label: "باز کردن قفل",
    confirmMessage: "ویرایش رکورد قفل شده است؛ می‌خواهید آن را باز کنید؟",
    confirmTitle: "ویرایش قفل شده است",
  },
};
