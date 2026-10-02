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
