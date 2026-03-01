import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ?\n\n(ሁሉም ለውጦች አስቀድመው ተቀምጠዋል)",
  checkStatus: "የማመሳሰል ሁኔታን ያረጋግጡ",
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
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "ከተወሰኑ አካላት ({{entityDefs}}) ጋር የተያያዙ የተዘረዘሩ አካላት ካሉ ይቀጥሉ፣ ቀደም ሲል የገቡ እሴቶችን (ካለ) በመሰረዝ እንደገና ይዘረዘራሉ።\n\nየተዘረዘሩትን አካላት ማዘመን ይፈልጋሉ?",
    title: "የተዘረዘሩ አካላትን ያዘምኑ",
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
  exportNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ላክ",
  formLanguage: "የቅጽ ቋንቋ፡",
  noEntitiesDefined: "ምንም ክፍሎች አልተገለጹም",
  goToDataEntry: "ወደ መረጃ ማስገቢያ ይሂዱ",
  goToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ",
  gpsLockingEnabledWarning: "ማስጠንቀቂያ፡ የጂፒኤስ መቆለፊያ ነቅቷል!",
  listOfRecords: "የመዝገቦች",
  localBackup: "የአካባቢ ምትኬ",
  newRecord: "አዲስ",
  node: {
    cannotAddMoreItems: {
      maxCountReached: "ተጨማሪ እቃዎችን መጨመር አይቻልም: ከፍተኛው ቆጠራ ደርሷል",
    },
    cannotDeleteNode: {
      noNodeFound: "ኖድን መሰረዝ አይቻልም: ኖድ አልተገኘም",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "እሴቱን ማዘመን አይቻልም: ኖድ አልተገኘም",
    },
  },
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
  recordStatus: {
    new: "አዲስ",
    updated: "የዘመነ",
    conflicting: "የሚጋጭ",
    withValidationErrors: "ከማረጋገጫ ስህተቶች ጋር",
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
  uploadingData: {
    title: "Տվյալների վերբեռնում",
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
    selectAudio: "የድምጽ ፋይል ይምረጡ",
    selectFile: "ፋይል ይምረጡ",
    selectPicture: "ምስል ይምረጡ",
    selectVideo: "የቪዲዮ ፋይል ይምረጡ",
    deleteConfirmMessage: "ያለውን ፋይል ይሰርዙ?",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "የድምጽ መቅጃ ማስጀመር ላይ ስህተት፡ {{error}}",
      pausingRecording: "የድምጽ መቅጃ ማቆም ላይ ስህተት፡ {{error}}",
      resumingRecording: "የድምጽ መቅጃ መቀጠል ላይ ስህተት፡ {{error}}",
      savingRecording: "የተቀዳ ድምጽ ማስቀመጥ ላይ ስህተት",
      stoppingRecording: "የድምጽ መቅጃ ማቆም ላይ ስህተት፡ {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "የምስል ቅድመ እይታ",
    pictureResizedToSize: `ስዕሉ ወደ {{size}} መጠን ተቀይሯል።
የተፈቀደው ከፍተኛ መጠን: {{maxSizeMB}}MB።
ይህን ገደብ ለመቀየር ቅንብሮችን ያረጋግጡ ወይም የዳሰሳ ጥናቱ አስተዳዳሪን ይጠይቁ።`,
    resolution: "ጥራት",
    rotate: "ማዞር",
    rotationError: "ምስሉን ማዞር ላይ ስህተት፡ {{error}}",
  },
  dataExport: {
    confirm: {
      title: "ውሂብ መላክን አረጋግጥ",
      message: `የሚላኩ መዝገቦች፡
{{recordsCountSummary}}`,
      selectOptions: `የመላክ አማራጮችን ይምረጡ፡`,
    },

    error: "ውሂብ ወደ ውጭ በመላክ ላይ ስህተት። ዝርዝሮች፡ {{details}}",
    exportedSuccessfullyButFilesMissing:
      "ውሂብ በተሳካ ሁኔታ ወደ ውጭ ተልኳል ግን {{missingFiles}} ፋይሎች/ምስሎች ጠፍተዋል ወይም ተሰብረዋል። እባክዎ መዝገቦችዎን እና በአገልጋዩ ላይ ያሉትን መዝገቦች ያረጋግጡ።",
    exportingData: "ውሂብ በማልክ ላይ...",
    exportToCsv: "ወደ CSV ላክ",
    mergeConflictingRecords: "የሚጋጩ መዝገቦችን አዋህድ (ተመሳሳይ ቁልፎች)",
    noRecordsInDeviceToExport: "በመሣሪያው ውስጥ የሚላክ መዝገብ የለም",
    onlyNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ብቻ ላክ",
    onlyRecordsInRemoteServerCanBeImported:
      "በሩቅ አገልጋይ ውስጥ ያሉ ወይም በርቀት የተሻሻሉ መዝገቦች ብቻ ማስገባት ይቻላል",
    option: {
      [FlatDataExportOption.addCycle]: "ዎመድ ይጨምሩ",
      [FlatDataExportOption.includeAncestorAttributes]: "የአለፎች ባህሪያት",
      [FlatDataExportOption.includeCategoryItemsLabels]: "የአጭመጃነት ዘርዝሮች",
      [FlatDataExportOption.includeFiles]: "የፋይል ባህሪዎች",
      [FlatDataExportOption.includeTaxonScientificName]: "የታክሰን ሳይንሲፊክ ስም",
    },
    selectTarget: "የመላኪያ ዒላማ ይምረጡ",
    selectTargetMessage: "የመላኪያውን ዒላማ ይምረጡ፡",
    shareExportedFile: "የተላከውን ፋይል ያጋሩ",
    target: {
      remote: "የርቀት አገልጋይ",
      local: "የአካባቢ አቃፊ (ማውረድ)",
      share: "$t(common:shareFile)",
    },
    title: "ውሂብ ላክ",
  },
  location: {
    label: "ቦታ",
    gettingCurrentLocation: "የአሁኑን ሥፍራ በማግኘት ላይ",
    usingCurrentLocation: "የአሁኑን ሥፍራ በመጠቀም ላይ",
  },
  unlock: {
    label: "ክፈት",
    confirmMessage: "የመዝገብ እርማት ተቆልፏል፤ ይክፈቱት?",
    confirmTitle: "እርማት ተቆልፏል",
  },
};
