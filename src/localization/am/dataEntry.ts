import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "ይህ መዝገብ የሌላ የተጠቃሚ ቡድን ነው፤ ማየት ብቻ ይቻላል። ለማርትዕ ይቅዱት",
  autoSync: {
    checkbox: "ራስ-ሰር ማመሳሰል",
    synced: "{{count}} መዝገብ በራስ-ሰር ተመሳስሏል",
    synced_other: "{{count}} መዝገቦች በራስ-ሰር ተመሳስለዋል",
    statusLabel: "የማመሳሰል ሁኔታ:",
    statusTitle: "የማመሳሰል ሁኔታ",
    syncInProgressToast:
      "ራስ-ሰር ማመሳሰል በሂደት ላይ ነው። ውሂብ በእጅ ከመላክዎ በፊት እስኪጠናቀቅ ድረስ እባክዎ ይጠብቁ።",
    batteryDataWarning: "ከWi-Fi ውጭ ሲሆን የባትሪ እና የውሂብ አጠቃቀምን ሊጨምር ይችላል",
    syncNow: "አሁኑኑ ያመሳስሉ",
    recordSyncInProgress: "ይህ መዝገብ ከአገልጋዩ ጋር እየተመሳሰለ ነው። እባክዎ ትንሽ ይጠብቁ",
    status: {
      syncedTooltip: "ሁሉም መዝገቦች ከአገልጋዩ ጋር ተመሳስለዋል",
      pendingTooltip: "አንዳንድ መዝገቦች አሁንም መመሳሰል ያስፈልጋቸዋል። በራስ-ሰር ይላካሉ",
      errorTooltip:
        "አንዳንድ መዝገቦች የማመሳሰል ስህተቶች አሏቸው እና ትኩረትዎን ይፈልጋሉ። ለመፍታት 'ውሂብ ላክ'ን ይክፈቱ",
      needsManualFixTooltip:
        "አንዳንድ መዝገቦች እስኪያስተካክሏቸው ድረስ ሊመሳሰሉ አይችሉም (ለምሳሌ የጎደሉ ቁልፍ እሴቶች፣ ማዋሃድ በማይፈቀድበት ጊዜ በአገልጋዩ ላይ ካለ መዝገብ ጋር ተመሳሳይ ቁልፎች፣ ወይም ከአሁን በኋላ በመግቢያ ደረጃ ላይ ያልሆኑ)። በመዝገቦች ዝርዝር ውስጥ የማመሳሰል ሁኔታቸውን ያረጋግጡ",
      mergeWithSameKeysNotAllowedNote:
        "አንዳንድ መዝገቦች በአገልጋዩ ላይ ካለ መዝገብ ጋር ተመሳሳይ ቁልፍ አላቸው፣ እና ለዚህ ቅኝት እነሱን ማዋሃድ አይፈቀድም። የተለያዩ መዝገቦች ከሆኑ የቁልፍ እሴቶቻቸውን ይቀይሩ፤ ተመሳሳይ መዝገብ ከሆኑ የቅኝቱን አስተዳዳሪ ያነጋግሩ።",
      syncingTooltip: "መዝገቦችን በማመሳሰል ላይ...",
      progressPercent: "{{progressPercent}}%",
      uncheckedTooltip:
        "የማመሳሰል ሁኔታ እስካሁን አልተረጋገጠም። ለማረጋገጥ 'የማመሳሰል ሁኔታን ያረጋግጡ'ን ይጠቀሙ",
      offlineTooltip: "የበይነመረብ ግንኙነት የለም። ግንኙነት ሲመለስ ራስ-ሰር ማመሳሰል ይቀጥላል",
      authErrorTooltip:
        "ከአገልጋዩ ጋር የነበረው ክፍለ ጊዜ አልቋል። ራስ-ሰር ማመሳሰልን ለመቀጠል እንደገና ይግቡ",
      checkErrorTooltip:
        "በአገልጋይ ስህተት ምክንያት የማመሳሰል ሁኔታን ማረጋገጥ አልተቻለም። እንደገና ይሞክሩ",
      noCandidatesMessage: "አሁን የሚላክ ምንም ነገር የለም",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "ኖዶቹ ዳግም አይተገበሩም",
    message: `የሚከተሉት ኖዶች ዳግም አይተገበሩም:  
  
{{attributeNames}}  
  
እሴቶቻቸው ይጸዳሉ.  
መቀጠል?`,
  },
  confirmGoToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ?\n\n(ሁሉም ለውጦች አስቀድመው ተቀምጠዋል)",
  checkStatus: "የማመሳሰል ሁኔታን ያረጋግጡ",
  closestSamplingPoint: {
    findClosestSamplingPoint: "የቅርቡን ናሙና ነጥብ ያግኙ",
    findingClosestSamplingPoint: "የቅርቡን ናሙና ነጥብ በመፈለግ ላይ",
    minDistanceItemFound: "ንጥል በ {{minDistance}}ሜትር ርቀት ተገኝቷል",
    minDistanceItemFound_other: "ንጥሎች በ {{minDistance}}ሜትር ርቀት ተገኝተዋል",
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
  createRecordError: "አዲስ መዝገብ መፍጠር ላይ ስህተት፡ {{error}}",
  userGroupNotReady: {
    title: "የተጠቃሚ መረጃ ዝግጁ አይደለም",
    message: `የተጠቃሚ ቡድንዎ መረጃ ገና ከአገልጋዩ አልተገኘም። ይህ ዳሰሳ ጥናት በተጠቃሚ ቡድንዎ መሰረት አስቀድሞ የሚሞሉ ባህሪያት አሉት፣ ስለዚህ አሁን መዝገቡን መፍጠር ባዶ ወይም የተሳሳቱ ሊያደርጋቸው ይችላል።

ከአገልጋዩ እንደገና ማግኘት ይፈልጋሉ?`,
    fetchAgain: "እንደገና ያግኙ",
    stillNotReady: "የተጠቃሚ ቡድንዎን መረጃ ከአገልጋዩ ማግኘት አልተቻለም። መዝገብ አልተፈጠረም።",
  },
  updateAttributeError: "እሴቱን ማዘመን ላይ ስህተት፡ {{error}}",
  cycle: "ዙር",
  cycleForNewRecords: "ለአዲስ መዝገቦች ዙር፡",
  options: "አማራጮች",
  editNodeDef: "{{nodeDef}} ያርትዑ",
  viewNodeDef: "{{nodeDef}} ይመልከቱ",
  errorFetchingRecordsSyncStatus:
    "መዝገቦችን ከአገልጋዩ በማግኘት ላይ ስህተት።\n\nየግንኙነት ቅንብሮችን ያረጋግጡ።\n\nዝርዝሮች፡ {{details}}",
  errorGeneratingRecordsExportFile:
    "የመዝገብ ወደ ውጭ መላኪያ ፋይል በመፍጠር ላይ ስህተት፡ {{details}}",
  errorLoadingRecords: "መዝገቦችን በመጫን ላይ ስህተት፡ {{details}}",
  exportNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ላክ",
  formLanguage: "የቅጽ ቋንቋ፡",
  entityListColumns: {
    button: "አምዶች",
    hideAll: "ሁሉንም ደብቅ",
    keys: "ቁልፍ ባህሪያት",
    other: "ሌሎች ባህሪያት",
    reset: "ነባሪ",
    showAll: "ሁሉንም አሳይ",
    summary: "የማጠቃለያ ባህሪያት",
    title: "የሚታዩ አምዶች",
  },
  noEntitiesDefined: "ምንም ክፍሎች አልተገለጹም",
  goToDataEntry: "ወደ መረጃ ማስገቢያ ይሂዱ",
  goToListOfRecords: "ወደ መዝገቦች ዝርዝር ይሂዱ",
  gpsLockingEnabledWarning: "ማስጠንቀቂያ፡ የጂፒኤስ መቆለፊያ ነቅቷል!",
  listOfRecords: "የመዝገቦች",
  localBackup: "የአካባቢ ምትኬ",
  newRecord: "አዲስ መዝገብ",
  newRecordShort: "አዲስ",
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
  recordCompletion: {
    shortDescription: "{{percent}}% ተጠናቋል",
  },
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
    conflictingModifiedRemotely: "በመሣሪያውና በአገልጋዩ ላይ ተስተካክሏል",
    withValidationErrors: "ከማረጋገጫ ስህተቶች ጋር",
  },
  sendData: "ውሂብ ላክ",
  showOnlyLocalRecords: "የአካባቢ መዝገቦችን ብቻ አሳይ",
  syncedOn: "የተመሳሰለው በ",
  syncStatusHeader: "ሁኔታ",
  syncStatus: {
    conflictingKeys: "ተመሳሳይ ቁልፍ(ች) ያለው መዝገብ አስቀድሞ አለ",
    deviceDateBehindServer:
      "አልተሰቀለም፡ የመሣሪያው ቀን ከአገልጋዩ ወደ ኋላ ቀርቷል (ትክክለኛውን ቀን እና ሰዓት ያስተካክሉ፣ ከዚያም መዝገቡን እንደገና ያርትዑ)",
    keysNotSpecified: "ቁልፍ(ች) አልተገለጹም",
    new: "አዲስ (ገና አልተሰቀለም)",
    notModified: "ያልተሻሻለ (የሚሰቀል ምንም ለውጥ የለም)",
    modifiedLocally: "በአካባቢው የተሻሻለ",
    modifiedLocallyAndRemotely: "በአካባቢው እና በሩቅ አገልጋይ ላይ የተሻሻለ (ግጭት)",
    modifiedRemotely: "በሩቅ አገልጋይ የተሻሻለ",
    notInEntryStepAnymore: "ከእንግዲህ በማስገቢያ ደረጃ የለም (በማጽዳት ወይም ትንተና ደረጃ)",
  },
  processingData: {
    title: "Տվյալների մշակում",
  },
  uploadingData: {
    title: "ውሂብ በመስቀል ላይ",
    size: "የፋይል መጠን: {{size}}",
    speed: "የመስቀል ፍጥነት: {{speed}}/ሰ",
    eta: "የሚቀረው ግምታዊ ጊዜ: {{eta}}",
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
    selectItem_other: "ንጥሎችን ይምረጡ",
  },
  coordinate: {
    longPressMarkerToMove: "ምልክቱን ለማንቀሳቀስ በረጅሙ ይጫኑት",
    saveNewPosition: "አዲስ ቦታ አስቀምጥ",
    accuracy: "ትክክለኛነት (ሜ)",
    altitude: "ከፍታ (ሜ)",
    altitudeAccuracy: "የከፍታ ትክክለኛነት (ሜ)",
    angleToTargetLocation: "ወደ መድረሻ አንግል",
    confirmConvertCoordinate: "ከ SRS {{srsFrom}} ወደ SRS {{srsTo}} መጋጠሚያ ይለውጡ?",
    connectingToSource: "በ{{label}} ላይ በመገናኘት ላይ...",
    convert: "ቀይር",
    currentLocation: "የአሁኑ ሥፍራ",
    distance: "ርቀት (ሜ)",
    externalGpsGenericLabel: "ውጫዊ GPS መሳሪያ",
    getLocation: "ቦታ ያግኙ",
    heading: "አቅጣጫ (ዲግሪ)",
    map: {
      attributeViewerTitle: 'የ"{{attributeLabel}}" ቦታ',
      chooserTitle: "በካርታ አሳይ",
      inApp: "Arena Mobile",
      inAppDescription: "ያለ በይነመረብ ከወረዱ ካርታዎች ጋር ይሰራል",
      inAppDescriptionRelocatable:
        "ያለ በይነመረብ ከወረዱ ካርታዎች ጋር ይሰራል።\nቦታውን ማንቀሳቀስ ይቻላል",
      otherApp: "ሌላ መተግበሪያ…",
      otherAppDescription: "ቦታ ማሳየት ከሚችሉ ሁሉም የተጫኑ መተግበሪያዎች ውስጥ ይምረጡ",
      show: "በካርታ አሳይ",
      targetViewerTitle: 'የ"{{attributeLabel}}" ዒላማ ቦታ',
      viewerTitle: "ቦታ",
    },
    headingOffset: "የአቅጣጫ ልዩነት",
    headingSource: "የአቅጣጫ ምንጭ",
    headingSourceMagnetometer: "ሴንሰር",
    headingSourceLocation: "GPS",
    keepXAndY: "X እና Y ን ያቆዩ",
    locationHeadingNotAvailable: "የGPS አቅጣጫ አይገኝም!",
    magnetometerNotAvailable: "ማግኔቶሜትር የለም!",
    navigateToTarget: "ወደ መድረሻ ይሂዱ",
    srs: "$t(common:srs)",
    targetLocation: "የታለመ አካባቢ",
    useCurrentLocation: "የአሁኑን ሥፍራ ይጠቀሙ",
    usingInternalFallback: "የውስጥ GPS በመጠቀም ላይ ({{label}} አይገኝም)",
    usingSource: "{{label}} በመጠቀም ላይ",
    x: "X",
    y: "Y",
    viewModeCompass: "Compass",
    viewModeRadar: "ራዳር",
    locationNavigatorInfo: {
      title: "የቦታ መምሪያ (Location Navigator)",
      description:
        "የመሣሪያዎን ጂፒኤስ እና ዳሳሾች በመጠቀም ወደ ዒላማ መጋጠሚያ ይመራዎታል። ዒላማውን ቦታ አሁን ካሉበት ቦታ አንጻር ያሳያል እና በመስክ ላይ ወደ እሱ እንዲሄዱ ያስችልዎታል።",
      viewModesTitle: "የእይታ ሁነታዎች",
      compassTitle: "ኮምፓስ",
      compassDesc:
        "ወደ ሰሜን የተሰለፈ የሚሽከረከር የኮምፓስ ጽጌረዳ ያሳያል። ቀስት ወደ ዒላማው ይጠቁማል። ከዒላማው በጣም ሲቀርቡ (የቅርበት ሁነታ)፣ ቀስቱ በትክክለኛነት ክበቡ ላይ የዒላማውን አንጻራዊ ቦታ በሚያሳይ ነጥብ ይተካል።",
      radarTitle: "ራዳር",
      radarDesc:
        "ቦታዎ በመሃል ላይ ተስተካክሎ ከላይ የሚታይ የራዳር እይታ ያሳያል። የዒላማው ነጥብ ትክክለኛ አቅጣጫውን እና ርቀቱን ለማሳየት በእውነተኛ ጊዜ በዙሪያዎ ይንቀሳቀሳል።",
      headingSourcesTitle: "የአቅጣጫ ምንጮች",
      sensorTitle: "ዳሳሽ (ማግኔቶሜትር)",
      sensorDesc:
        "የመሣሪያውን አብሮ የተሰራ ማግኔቶሜትር (የኮምፓስ ቺፕ) ይጠቀማል። ቆመው ሳሉም ይሰራል፣ ነገር ግን በአቅራቢያ ባሉ የብረት ነገሮች ወይም በመግነጢሳዊ ጣልቃ ገብነት ሊጎዳ ይችላል።",
      gpsTitle: "ጂፒኤስ",
      gpsDesc:
        "አቅጣጫን ከጂፒኤስ እንቅስቃሴ ያገኛል። በክፍት ቦታዎች የበለጠ ትክክለኛ ነው፣ ነገር ግን በእግር መጓዝ ይጠይቃል እና በሁሉም መሣሪያዎች ላይ ላይገኝ ይችላል።",
    },
  },
  geo: {
    drawPolygon: "ፖሊጎን ይሳሉ",
    editPolygon: "ፖሊጎን ያርትዑ",
    selectPolygonInstruction: "ፖሊጎኑን ለመምረጥ ይንኩት",
    selectPointInstructions: `- ነጥብ ለመምረጥ ይንኩት።  
- አዲስ ነጥብ ለመጨመር መካከለኛ ነጥብ ይንኩ።`,
    editPolygonInstructions: "የተመረጠውን ነጥብ ለማንቀሳቀስ ረጅም ጊዜ ተጭነው ይጎትቱት።",
    tapToAddPoints: `ነጥቦች ለመጨመር በካርታው ላይ ይንኩ።  
ከጨረሱ '$t(common:stop)' ይጫኑ።`,
    deleteSelectedPoint: "የተመረጠውን ነጥብ ሰርዝ",
    addCurrentLocationPoint: "የአሁን ቦታ ጨምር",
    addCurrentLocationPointInstructions:
      "አሁን ያለውን አካባቢ ወደ ፖሊጎኑ ለመጨመር '$t(dataEntry:geo.addCurrentLocationPoint)' ይጫኑ",
  },
  positionTracking: {
    title: "የቦታ ክትትል",
    start: "ክትትል ጀምር",
    resume: "ቀጥል",
    restart: "እንደገና ጀምር",
    restartConfirm: {
      title: "የተቀዳውን መስመር ልሰርዝ?",
      message:
        "በዚህ ባህሪ ውስጥ እስካሁን የተቀዱት ሁሉም ነጥቦች ይሰረዛሉ እና ክትትሉ ከመጀመሪያው ይጀምራል። ይህ ሊቀለበስ አይችልም።",
    },
    delete: "መስመሩን ሰርዝ",
    deleteConfirm: {
      title: "የተቀዳውን መስመር ልሰርዝ?",
      message:
        "በዚህ ባህሪ ውስጥ የተቀዱት ሁሉም ነጥቦች ይሰረዛሉ እና ባህሪው ባዶ ሆኖ ይቀራል። ይህ ሊቀለበስ አይችልም።",
    },
    stop: "አቁም",
    showTrack: "መስመሩን አሳይ",
    retry: "እንደገና ሞክር",
    status: {
      idle: "ክትትል የለም",
      stopped: "ክትትል ቆሟል",
      starting: "ክትትል በመጀመር ላይ…",
      tracking: "በክትትል ላይ",
      paused: "ክትትል ለአፍታ ቆሟል",
    },
    waitingForFix: "ጂፒኤስን በመጠበቅ ላይ…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "{{count}} ነጥቦች",
    trackSummary: "{{length}} · {{pointsCount}} ነጥቦች · {{duration}}",
    attributeNotEditable: "የዚህ ባህሪ እሴት በቦታ ክትትል ይመዘገባል",
    stopConfirm: "ክትትሉን ላቁም? የተቀዳው መስመር በባህሪው ውስጥ ይቀመጣል እና በኋላ ሊቀጥል ይችላል።",
    stopCurrentConfirm: "ሌላ ባህሪ በክትትል ላይ ነው፡ የእሱን ክትትል አቁሜ የዚህን ክትትል ልጀምር?",
    interrupted: "የቦታ ክትትል ተቋርጧል፡ የተቀዳው መስመር ተቀምጧል። ለመቀጠል ክትትሉን ይቀጥሉ።",
    error: {
      generic: "የቦታ ክትትልን መጀመር አልተቻለም",
      permissionDenied: "ቦታውን መከታተል አልተቻለም፡ ወደ አካባቢው መዳረሻ አልተሰጠም",
      locationServicesOff: "ቦታውን መከታተል አልተቻለም፡ የአካባቢ አገልግሎቶች ጠፍተዋል",
      notSaved: "መስመሩ እስካሁን በባህሪው ውስጥ ሊቀመጥ አልቻለም፡ በኋላ ይቀመጣል",
    },
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
    fileMissing: "ፋይል በአካባቢ ማከማቻ ውስጥ አልተገኘም",
    fileSelectError: "ፋይል በመምረጥ ላይ ስህተት፡ {{error}}",
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
    cameraOpenError: "ካሜራን በመክፈት ላይ ስህተት፡ {{error}}",
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
    mergeConflictingRecords: "የሚጋጩ መዝገቦችን አዋህድ",
    mergeWithSameKeysNotAllowed:
      "ለዚህ ቅኝት ተመሳሳይ ቁልፍ ያላቸውን መዝገቦች ማዋሃድ አይፈቀድም፣ ስለዚህ የሚጋጩ ቁልፎች ያላቸው መዝገቦች አይላኩም። የተለያዩ መዝገቦች ከሆኑ የቁልፍ እሴቶቻቸውን ይቀይሩ፤ ተመሳሳይ መዝገብ ከሆኑ የቅኝቱን አስተዳዳሪ ያነጋግሩ።",
    mergeSameRecordConflictConfirm: {
      title: "በሁለቱም መሣሪያዎች ላይ የተስተካከሉ መዝገቦችን አዋህድ",
      message: `{{count}} መዝገብ(ዎች) ይህ መሣሪያ ለመጨረሻ ጊዜ ካመሳሰለ በኋላ በአገልጋዩ ላይም ተስተካክለዋል።

ማዋሃድ ለውጦችዎን ከአገልጋዩ ለውጦች ጋር ያዋህዳል፦ ለእያንዳንዱ መስክ፣ በመጨረሻ የተስተካከለው ዋጋ ይቀመጣል፣ እና በማንኛውም መሣሪያ ላይ የተጨመሩ አዲስ ክፍሎች ይቀመጣሉ።

ይህ አስቀድሞ ሊታይ አይችልም። ለማረጋገጥ እና ለመቀጠል ይጥረጉ።`,
    },
    noRecordsInDeviceToExport: "በመሣሪያው ውስጥ የሚላክ መዝገብ የለም",
    onlyNewOrUpdatedRecords: "አዲስ ወይም የተሻሻሉ መዝገቦችን ብቻ ላክ",
    recordsMergedMessage: `የሚከተሉት መዝገቦች በአገልጋዩ ላይ ቀድሞውኑ ካለው አዲሱ ስሪት ጋር ተዋህደዋል፦
{{recordsList}}

የእነዚያ መዝገቦች የተዋሃደ ስሪት በራስ-ሰር ተገኝቷል።`,
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
    recordsWithMissingFilesConfirm: {
      confirmButton: "ያጡ ፋይሎች ሳይጨምሩ ወደ ውጭ ላክ",
      title: "ያጡ ፋይሎች",
      message: `የሚከተሉ መዝገቦች ያጡ ፋይሎች አሏቸው እና ያለ እነርሱ ወደ ውጭ ይላካሉ:\n{{recordsList}}\n\nሆኖም ቀጠል ትፈልጋለህ?`,
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
