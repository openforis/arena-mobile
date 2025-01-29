export default {
  confirmGoToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ?\n\n(ሁሉም ለውጦች አስቀድመው ተቀምጠዋል)",
  checkSyncStatus: "የማመሳሰል ሁኔታን ያረጋግጡ",
  closestSamplingPoint: {
    findClosestSamplingPoint: "የቅርቡን ናሙና ነጥብ ያግኙ",
    findingClosestSamplingPoint: "የቅርቡን ናሙና ነጥብ በመፈለግ ላይ",
    minDistanceItemFound: "ንጥል በ {{minDistance}}ሜትር ርቀት ተገኝቷል",
    minDistanceItemFound_plural: "ንጥሎች በ {{minDistance}}ሜትር ርቀት ተገኝተዋል",
    useSelectedItem: "የተመረጠውን ንጥል ይጠቀሙ",
  },
  confirmDeleteSelectedItems: {
    message: "የተመረጡትን ንጥሎች ይሰርዙ?",
  },
  confirmDeleteValue: {
    message: "ይህን እሴት ይሰርዙ?",
  },
  confirmOverwriteValue: {
    message: "ያለውን እሴት ይተኩ?",
  },
  cycle: "ዙር",
  cycleForNewRecords: "ለአዲስ መዝገቦች ዙር፡",
  options: "አማራጮች",
  editNodeDef: "{{nodeDef}} ያርትዑ",
  errorFetchingRecordsSyncStatus:
    "መዝገቦችን ከአገልጋዩ በማግኘት ላይ ስህተት።\n\nየግንኙነት ቅንብሮችን ያረጋግጡ።\n\nዝርዝሮች፡ {{details}}",
  errorGeneratingRecordsExportFile:
    "የመዝገብ ወደ ውጭ መላኪያ ፋይል በመፍጠር ላይ ስህተት፡ {{details}}",
  errorLoadingRecords: "መዝገቦችን በመጫን ላይ ስህተት፡ {{details}}",
  exportData: {
    title: "ውሂብ ላክ",
    confirm: {
      title: "ውሂብ መላክን አረጋግጥ",
      message:
        "የሚላኩ መዝገቦች፡\n- {{newRecordsCount}} አዲስ መዝገቦች፤\n- {{updatedRecordsCount}} የተሻሻሉ መዝገቦች\n- {{conflictingRecordsCount}} የሚጋጩ መዝገቦች",
    },
    noRecordsInDeviceToExport: "በመሣሪያው ውስጥ የሚላክ መዝገብ የለም",
    onlyNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ብቻ ላክ",
    mergeConflictingRecords: "የሚጋጩ መዝገቦችን አዋህድ (ተመሳሳይ ቁልፎች)",
    onlyRecordsInRemoteServerCanBeImported:
      "በሩቅ አገልጋይ ውስጥ ያሉ ወይም በርቀት የተሻሻሉ መዝገቦች ብቻ ማስገባት ይቻላል",
  },
  exportNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ላክ",
  formLanguage: "የቅጽ ቋንቋ፡",
  noEntitiesDefined: "ምንም ክፍሎች አልተገለጹም",
  goToDataEntry: "ወደ መረጃ ማስገቢያ ይሂዱ",
  goToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ",
  gpsLockingEnabledWarning: "ማስጠንቀቂያ፡ የጂፒኤስ መቆለፊያ ነቅቷል!",
  listOfRecords: "የመዝገቦች ዝርዝር",
  localBackup: "የአካባቢ ምትኬ",
  newRecord: "አዲስ",
  noRecordsFound: "ምንም መዝገቦች አልተገኙም",
  recordEditor: "የመዝገብ አርታዒ",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "ከቀድሞው ዙር እሴቶችን አሳይ",
      message: "የቀድሞውን ዙር ይምረጡ፡",
      cycleItem: "ዙር {{cycleLabel}}",
    },
    foundMessage: "በቀድሞው ዙር መዝገብ ተገኝቷል!",
    notFoundMessage: "በ {{cycle}} ዙር ውስጥ {{keyValues}} ቁልፎች ያለው መዝገብ አልተገኘም",
    confirmFetchRecordInCycle:
      "በ {{cycle}} ዙር ውስጥ {{keyValues}} ቁልፎች ያለው መዝገብ ሙሉ በሙሉ አልተጫነም፤ ከአገልጋዩ ያውርዱት?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): የመዝገቦችን ዝርዝር ከአገልጋዩ ያግኙ እና እንደገና ይሞክሩ?",
    fetchError: "በቀድሞው ዙር መዝገብን በማግኘት ላይ ስህተት፡ {{details}}",
    multipleRecordsFound:
      "በ {{cycle}} ዙር ውስጥ {{keyValues}} ቁልፎች ያላቸው ብዙ መዝገቦች ተገኝተዋል",
    valuePanelHeader: "እሴት በ {{prevCycle}} ዙር",
  },
  sendData: "ውሂብ ላክ",
  showOnlyLocalRecords: "የአካባቢ መዝገቦችን ብቻ አሳይ",
  syncedOn: "የተመሳሰለው በ",
  syncStatusHeader: "ሁኔታ",
  syncStatus: {
    conflictingKeys: "ተመሳሳይ ቁልፍ(ች) ያለው መዝገብ አስቀድሞ አለ",
    keysNotSpecified: "ቁልፍ(ች) አልተገለጹም",
    new: "አዲስ (ገና አልተሰቀለም)",
    notModified: "ያልተሻሻለ (የሚሰቀል ምንም ለውጥ የለም)",
    modifiedLocally: "በአካባቢው የተሻሻለ",
    modifiedRemotely: "በሩቅ አገልጋይ የተሻሻለ",
    notInEntryStepAnymore: "ከእንግዲህ በማስገቢያ ደረጃ የለም (በማጽዳት ወይም ትንተና ደረጃ)",
  },
  validationReport: {
    title: "የማረጋገጫ ሪፖርት",
    noErrorsFound: "እንኳን ደስ አላችሁ፣ ምንም ስህተቶች አልተገኙም!",
  },
  viewModeLabel: "የእይታ ሁነታ",
  viewMode: {
    form: "ቅጽ",
    oneNode: "አንድ መስቀለኛ መንገድ",
  },
  code: {
    selectItem: "ንጥል ይምረጡ",
    selectItem_plural: "ንጥሎችን ይምረጡ",
  },
  coordinate: {
    accuracy: "ትክክለኛነት (ሜ)",
    altitude: "ከፍታ (ሜ)",
    altitudeAccuracy: "የከፍታ ትክክለኛነት (ሜ)",
    angleToTargetLocation: "ወደ መድረሻ አንግል",
    confirmConvertCoordinate: "ከ SRS {{srsFrom}} ወደ SRS {{srsTo}} መጋጠሚያ ይለውጡ?",
    convert: "ቀይር",
    currentLocation: "የአሁኑ ሥፍራ",
    distance: "ርቀት (ሜ)",
    getLocation: "ቦታ ያግኙ",
    heading: "አቅጣጫ (ዲግሪ)",
    keepXAndY: "X እና Y ን ያቆዩ",
    magnetometerNotAvailable: "ማግኔቶሜትር የለም!",
    navigateToTarget: "ወደ መድረሻ ይሂዱ",
    srs: "$t(common:srs)",
    useCurrentLocation: "የአሁኑን ሥፍራ ይጠቀሙ",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "ታክሶን ይፈልጉ",
    taxonNotSelected: "--- ታክሶን አልተመረጠም ---",
  },
  fileAttribute: {
    chooseAudio: "የድምጽ ፋይል ይምረጡ",
    chooseFile: "ፋይል ይምረጡ",
    choosePicture: "ምስል ይምረጡ",
    chooseVideo: "የቪዲዮ ፋይል ይምረጡ",
    deleteConfirmMessage: "ያለውን ፋይል ይሰርዙ?",
  },

  fileAttributeImage: {
    imagePreview: "የምስል ቅድመ እይታ",
    pictureResizedToSize: "ምስሉ ወደ {{size}} መጠን ተቀይሯል",
    resolution: "ጥራት",
  },
  dataExport: {
    error: "ውሂብ ወደ ውጭ በመላክ ላይ ስህተት። ዝርዝሮች፡ {{details}}",
    selectTarget: "የመላኪያ ዒላማ ይምረጡ",
    selectTargetMessage: "የመላኪያውን ዒላማ ይምረጡ፡",
    target: {
      remote: "የርቀት አገልጋይ",
      local: "የአካባቢ አቃፊ (ማውረድ)",
      share: "ፋይል ያጋሩ",
    },
    shareExportedFile: "የተላከውን ፋይል ያጋሩ",
  },
  location: {
    gettingCurrentLocation: "የአሁኑን ሥፍራ በማግኘት ላይ",
    usingCurrentLocation: "የአሁኑን ሥፍራ በመጠቀም ላይ",
  },
  unlock: {
    label: "ክፈት",
    confirmMessage: "የመዝገብ እርማት ተቆልፏል፤ ይክፈቱት?",
    confirmTitle: "እርማት ተቆልፏል",
  },
};
