export default {
  cloneRecords: {
    title: "کلون",
    confirm: {
      message:
        "{{recordsCount}} رکورد انتخاب شده را به چرخه {{cycle}} کلون کنید؟",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "فقط رکوردهای وارد شده در دستگاه یا تغییر یافته در محلی را می توان به چرخه بعدی کلون کرد",
    completeSuccessfully: "رکوردها با موفقیت به چرخه {{cycle}} کلون شدند!",
  },
  confirmImportRecordFromServer: "رکورد را از سرور وارد کنید؟",
  continueEditing: {
    title: "ادامه ویرایش",
    confirm: {
      message: "ادامه ویرایش از جایی که متوقف کردید؟",
    },
  },
  dateModifiedRemotely: "تاریخ تغییر در سرور",
  deleteRecordsConfirm: {
    title: "حذف رکوردها",
    message: "آیا از حذف رکوردهای انتخاب شده مطمئن هستید؟",
  },
  duplicateKey: {
    title: "کلید تکراری",
    message: `رکورد دیگری با همان کلید ({{keyValues}}) از قبل وجود دارد.`,
  },
  exportRecords: {
    title: "اکسپورت",
  },
  importRecord: "وارد کردن رکورد",
  importRecords: {
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "وارد کردن رکوردها امکان‌پذیر نیست: این نظرسنجی نباید در آرنا موبایل قابل مشاهده باشد",
      recordsDownloadNotAllowed: "وارد کردن رکوردها از سرور آرنا مجاز نیست",
    },
  },
  importRecordsFromFile: {
    title: "وارد کردن",
    confirmMessage: `رکوردها را از فایل انتخاب شده 
  {{fileName}} وارد کنید؟`,
    invalidFileType: "نوع فایل نامعتبر است (انتظار می رود .zip باشد)",
    overwriteExistingRecords: "بازنویسی رکوردهای موجود",
    selectFile: "انتخاب فایل",
  },
  importCompleteSuccessfully: `وارد کردن رکوردها با موفقیت انجام شد!
  - {{processedRecords}} رکورد پردازش شد
  - {{insertedRecords}} رکورد درج شد
  - {{updatedRecords}} رکورد به روز شد`,
  importFailed: "وارد کردن رکوردها با شکست مواجه شد: {{details}}",
  loadStatus: {
    title: "بارگذاری شده",
    C: "کامل",
    P: "جزئی (بدون فایل ها)",
    S: "فقط خلاصه",
  },
  origin: { title: "منشاء", L: "محلی", R: "از راه دور" },
  owner: "مالک",
  sendData: {
    error: {
      generic: "ارسال داده‌ها به سرور امکان‌پذیر نیست: {{details}}",
      surveyNotVisibleInMobile:
        "نظرسنجی فعلی نباید در آرنا موبایل قابل مشاهده باشد",
      recordsUploadNotAllowed:
        "بارگذاری رکوردها از آرنا موبایل به سرور مجاز نیست",
    },
  },
};
