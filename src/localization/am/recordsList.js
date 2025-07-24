export default {
  cloneRecords: {
    title: "ቅዳ",
    confirm: {
      message: "የተመረጡትን {{recordsCount}} መዝገቦች ወደ ዑደት {{cycle}} ይቅዱ?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "በመሣሪያው ላይ የገቡ ወይም በአካባቢው የተሻሻሉ መዝገቦች ብቻ ወደ ቀጣዩ ዑደት ሊቀዱ ይችላሉ",
    completeSuccessfully: "መዝገቦቹ በተሳካ ሁኔታ ወደ ዑደት {{cycle}} ተቀድተዋል!",
  },
  confirmImportRecordFromServer: "መዝገብ ከአገልጋዩ ያስገቡ?",
  continueEditing: {
    title: "አርትዖት ይቀጥሉ",
    confirm: {
      message: "ካቆሙበት ቦታ አርትዖት ይቀጥሉ?",
    },
  },
  dateModifiedRemotely: "የርቀት ማሻሻያ ቀን",
  deleteRecordsConfirm: {
    title: "መዝገቦችን ሰርዝ",
    message: "የተመረጡትን መዝገቦች ይሰርዙ?",
  },
  duplicateKey: {
    title: "የተባዛ ቁልፍ",
    message: "ተመሳሳይ ቁልፍ ({{keyValues}}) ያለው ሌላ መዝገብ አስቀድሞ አለ።",
  },
  exportRecords: {
    title: "ላክ",
  },
  importRecord: "መዝገብ አስገባ",
  importRecords: {
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "መረጃዎችን ማስገባት አይቻልም: ይህ ዳሰሳ በአሬና ሞባይል ላይ መታየት የለበትም",
      recordsDownloadNotAllowed: "መረጃዎችን ከአሬና አገልጋይ ማስገባት አይፈቀድም",
    },
  },
  importRecordsFromFile: {
    title: "አስገባ",
    confirmMessage: "መዝገቦችን ከተመረጠው ፋይል ያስገቡ\n{{fileName}}?",
    invalidFileType: "ልክ ያልሆነ የፋይል አይነት (.zip ይጠበቃል)",
    overwriteExistingRecords: "ያሉትን መዝገቦች ይተኩ",
    selectFile: "ፋይል ይምረጡ",
  },
  importCompleteSuccessfully:
    "የመዝገብ ማስገባት በተሳካ ሁኔታ ተጠናቋል!\n- {{processedRecords}} መዝገቦች ተስተናግደዋል\n- {{insertedRecords}} መዝገቦች ገብተዋል\n- {{updatedRecords}} መዝገቦች ተዘምነዋል",
  importFailed: "የመዝገብ ማስገባት አልተሳካም: {{details}}",
  loadStatus: {
    title: "የተጫነ",
    C: "የተሟላ",
    P: "ከፋይሎች በስተቀር (ከፊል)",
    S: "ማጠቃለያ ብቻ",
  },
  origin: {
    title: "ምንጭ",
    L: "አካባቢያዊ",
    R: "የርቀት",
  },
  owner: "ባለቤት",
  sendData: {
    error: {
      generic: "መረጃውን ወደ አገልጋዩ መላክ አይቻልም: {{details}}",
      surveyNotVisibleInMobile: "የአሁኑ ዳሰሳ በአሬና ሞባይል ላይ መታየት የለበትም",
      recordsUploadNotAllowed: "መረጃዎችን ከአሬና ሞባይል ወደ አገልጋዩ መስቀል አይፈቀድም",
    },
  },
};
