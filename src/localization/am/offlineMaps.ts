export default {
  title: "ከመስመር ውጭ ካርታዎች",
  description:
    "ወደ መስክ ከመሄድዎ በፊት የሚፈልጉትን አካባቢ ካርታ ያውርዱ፦ የጂኦግራፊ ባህሪያትን ሲስሉ ወይም ሲመለከቱ ያለ በይነመረብ ግንኙነትም ይገኛል።",
  freeLayersNotInUse:
    "ከመስመር ውጭ ካርታዎች ጥቅም ላይ የሚውሉት በቅንብሮች ውስጥ የካርታ አቅራቢው 'Free map layers' ሲሆን ብቻ ነው።",
  useFreeLayers: "ነፃ የካርታ ንብርብሮችን ተጠቀም",
  offlineMode: "ከመስመር ውጭ",
  addArea: "አካባቢ ጨምር",
  deleteAll: "ሁሉንም ሰርዝ",
  deleteAllConfirm:
    "ሁሉም ከመስመር ውጭ የካርታ አካባቢዎች እና በዚህ መሣሪያ ላይ የተቀመጡ ሁሉም የካርታ ታይሎች ይሰረዙ?",
  clearCache: "የካርታ መሸጎጫ አጽዳ",
  clearCacheConfirm:
    "በዚህ መሣሪያ ላይ የተቀመጡ ሁሉም የካርታ ታይሎች (ካርታዎችን ሲመለከቱ የተሸጎጡ ታይሎች) ይሰረዙ?",
  noAreas: "እስካሁን ምንም ከመስመር ውጭ የካርታ አካባቢ አልወረደም",
  storage: {
    used: "የካርታ ታይሎች የያዙት ቦታ (የወረዱ አካባቢዎች እና መሸጎጫ)፦",
    free: "በመሣሪያው ላይ ያለ ነፃ ቦታ፦",
  },
  layers: {
    esriWorldImagery: "ሳተላይት (Esri World Imagery)",
    openTopoMap: "ቶፖግራፊ (OpenTopoMap)",
    openStreetMap: "መደበኛ (OpenStreetMap፣ በመስመር ላይ ብቻ)",
  },
  customLayers: {
    title: "ብጁ የካርታ ንብርብሮች",
    description:
      "ከሌሎች የካርታ ንጣፍ አቅራቢዎች (XYZ ራስተር ንጣፎች) የካርታ ንብርብሮችን ያክሉ፤ አቅራቢው የሚፈልግ ከሆነ ከAPI ቁልፍ ጋር። በቅንብሮች ውስጥ እንደ ነባሪ የካርታ ንብርብር እና በካርታው ላይ ባለው የንብርብሮች አዝራር ሊመረጡ ይችላሉ። የአቅራቢው የአጠቃቀም ውል ይህን እንደሚፈቅድ ያረጋግጡ።",
    add: "ንብርብር አክል",
    noLayers: "እስካሁን ምንም ብጁ የካርታ ንብርብር አልተገለጸም",
    maxZoom: "ከፍተኛ ማጉላት: {{value}}",
    deleteConfirm:
      "ብጁ የካርታ ንብርብር '{{name}}' እና በዚህ መሣሪያ ላይ የተቀመጡ የካርታ ንጣፎቹ ይሰረዙ?",
    deleteConfirmWithOfflineAreas:
      "ብጁ የካርታ ንብርብር '{{name}}'፣ በዚህ መሣሪያ ላይ የተቀመጡ የካርታ ንጣፎቹ እና በእሱ የወረዱ ከመስመር ውጭ የካርታ አካባቢዎች ({{count}}) ይሰረዙ?",
    editor: {
      title: "ብጁ የካርታ ንብርብር",
      name: "ስም",
      url: "የURL አብነት",
      urlHint:
        "ምሳሌ: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}፣ {y} እና {z} ያስፈልጋሉ፤ {apiKey} በAPI ቁልፍ ይተካል።",
      apiKey: "የAPI ቁልፍ (አማራጭ)",
      apiKeyHint:
        "በመሣሪያው ደህንነቱ የተጠበቀ ማከማቻ ውስጥ ይቀመጣል፤ ለንጣፍ አቅራቢው በሚላኩ ጥያቄዎች ላይ ብቻ ጥቅም ላይ ይውላል።",
      attribution: "የምንጭ መግለጫ (አማራጭ)",
      attributionHint: "አቅራቢው የሚጠይቀው የቅጂ መብት ማስታወቂያ፤ በካርታው ላይ ይታያል።",
      urlChangeConfirm:
        "የURL አብነቱ ተቀይሯል፦ በዚህ መሣሪያ ላይ የተቀመጡ የዚህ ንብርብር የካርታ ንጣፎች ይሰረዛሉ፤ ከመስመር ውጭ የካርታ አካባቢዎቹም ({{count}}) እንደገና መውረድ አለባቸው። ይቀጥሉ?",
      test: {
        label: "ሞክር",
        success: "የካርታ ንጣፍ በተሳካ ሁኔታ ወርዷል",
        errorStatus:
          "የንጣፍ አቅራቢው የካርታ ንጣፍ አልመለሰም (የHTTP ሁኔታ: {{status}})፤ የURL አብነቱን እና የAPI ቁልፉን ያረጋግጡ",
        errorNotReachable:
          "የንጣፍ አቅራቢውን ማግኘት አልተቻለም፤ የURL አብነቱን እና የበይነመረብ ግንኙነቱን ያረጋግጡ",
      },
    },
    validation: {
      nameRequired: "ስም ያስፈልጋል",
      nameDuplicate: "ስሙ በሌላ ንብርብር ጥቅም ላይ ውሏል",
      urlRequired: "የURL አብነት ያስፈልጋል",
      urlNotHttps: "የURL አብነቱ በ https:// መጀመር አለበት",
      urlPlaceholdersMissing: "የURL አብነቱ {x}፣ {y} እና {z} ቦታ ያዢዎችን መያዝ አለበት",
      urlSubdomainNotSupported:
        "ቦታ ያዢው {s} አይደገፍም፦ ከአቅራቢው ንዑስ ጎራዎች በአንዱ (ለምሳሌ 'a') ይተኩት",
      apiKeyRequired: "የURL አብነቱ {apiKey} ይዟል፦ የAPI ቁልፍ ያስፈልጋል",
      apiKeyPlaceholderMissing:
        "የAPI ቁልፉ በሚጠበቅበት ቦታ ቦታ ያዢውን {apiKey} ወደ URL አብነቱ ያክሉ",
    },
  },
  mapTypes: {
    standard: "መደበኛ",
    satellite: "ሳተላይት",
    hybrid: "ድብልቅ",
  },
  area: {
    surface: "ስፋት፦ {{area}}",
    layer: "ንብርብር፦ {{layer}}",
    zoomLevels: "የማጉላት ደረጃዎች፦ {{minZoom}} - {{maxZoom}}",
    tiles: "ታይሎች፦ {{downloaded}} / {{total}}",
    size: "መጠን፦ {{size}}",
    lastUpdate: "የመጨረሻ ዝማኔ፦ {{date}}",
    missingTiles: "የጎደሉ ታይሎች፦ {{count}}",
    resumeDownload: "የጎደሉትን አውርድ",
    deleteConfirm: "ከመስመር ውጭ የካርታ አካባቢ '{{name}}' ይሰረዝ?",
    nameRequired: "ስም ያስፈልጋል",
    nameDuplicate: "ስሙ በሌላ አካባቢ ጥቅም ላይ ውሏል",
  },
  areaEditor: {
    title: "አዲስ ከመስመር ውጭ የካርታ አካባቢ",
    name: "ስም",
    layer: "ንብርብር",
    maxZoom: "ከፍተኛ ማጉላት፦ {{value}}",
    currentZoom: "የአሁኑ ማጉላት፦ {{value}}",
    surface: "ስፋት፦ {{area}}",
    drawAreaToEstimate: "የሚይዘውን ቦታ ለማየት የሚፈልጉትን አካባቢ በካርታው ላይ ይሳሉ",
    estimate: "{{tiles}} ታይሎች · ~{{size}} (ነፃ ቦታ፦ {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} ታይሎች፦ በጣም ብዙ (ከፍተኛ {{maxTiles}})፤ አካባቢውን ወይም ከፍተኛ ማጉላቱን ይቀንሱ",
    tooManyTiles:
      "አካባቢው በጣም ትልቅ ነው፦ ቢበዛ {{maxTiles}} ታይሎች ማውረድ ይቻላል፤ አካባቢውን ወይም ከፍተኛ ማጉላቱን ይቀንሱ",
    notEnoughSpace: "በመሣሪያው ላይ በቂ ነፃ ቦታ የለም",
    customLayerConfirm: {
      title: "ብጁ የካርታ ንብርብር",
      message:
        "ወደ {{tiles}} የሚጠጉ የካርታ ንጣፎች ከ'{{layer}}' ይወርዳሉ። የአቅራቢው የአጠቃቀም ውል በጅምላ ማውረድን እንደሚፈቅድ ያረጋግጡ፦ የተከለከለ ወይም ክፍያ የሚያስከፍል ሊሆን ይችላል። ይቀጥሉ?",
    },
    lowSpaceConfirm: {
      title: "ነፃ ቦታ አነስተኛ ነው",
      message:
        "ማውረዱ በግምት {{size}} ይጠቀማል፣ ይህም በመሣሪያው ላይ ካለው ነፃ ቦታ ({{freeSpace}}) {{percent}}% ነው። ይቀጥሉ?",
    },
  },
  areaViewer: {
    title: "ከመስመር ውጭ የካርታ አካባቢ",
    notFound: "ከመስመር ውጭ የካርታ አካባቢ አልተገኘም",
  },
  download: {
    label: "አውርድ",
    title: "የካርታ ታይሎችን በማውረድ ላይ",
    complete: "ከመስመር ውጭ የካርታ አካባቢ ወርዷል ({{size}})",
    completeWithMissingTiles:
      "ከመስመር ውጭ የካርታ አካባቢ ወርዷል ({{size}})፤ {{missingTiles}} ታይሎች ማውረድ አልተቻለም",
    error: "ከመስመር ውጭ የካርታ አካባቢን በማውረድ ላይ ስህተት፦ {{details}}",
  },
};
