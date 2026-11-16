export default {
  title: "የገቡ ካርታዎች",
  description:
    "በዚህ መሣሪያ ላይ ከተቀመጡ የጂኦስፓሻል (ጂኦሪፈረንስ የተደረገባቸው) PDF ወይም GeoTIFF ፋይሎች ካርታዎችን ያስመጡ፦ የበይነመረብ ግንኙነት ባይኖርም እንኳ በመተግበሪያው ሁሉም ካርታዎች ውስጥ ከመሠረታዊ ካርታው በላይ ይታያሉ።",
  rendererNotAvailable:
    "ይህ የመተግበሪያው ስሪት የገቡ ካርታዎችን አይደግፍም፦ ወደ የቅርብ ጊዜው ስሪት ያዘምኑት",
  importMap: "ካርታ አስመጣ",
  noMaps: "እስካሁን ምንም ካርታ አልመጣም",
  storage: {
    used: "በገቡ ካርታዎች የተያዘ ቦታ፦",
  },
  opacity: "ግልጽነት የሌለበት መጠን፦ {{value}}%",
  hideBaseMap: "የገባው ካርታ ብቻ",
  map: {
    fileName: "ፋይል፦ {{fileName}}",
    page: "ገጽ፦ {{page}}",
    zoomLevels: "የማጉላት ደረጃዎች፦ {{minZoom}} - {{maxZoom}}",
    tiles: "ታይሎች፦ {{count}}",
    size: "መጠን፦ {{size}} (የPDF ፋይል፦ {{sourceSize}})",
    sizeTilesOnly: "መጠን፦ {{size}}",
    datumWarning: "የካርታው ዳተም WGS84 አይደለም፦ ካርታው በጥቂት ሜትሮች ሊዛባ ይችላል",
    visible: "በካርታዎች ላይ አሳይ",
    deleteConfirm: "ካርታ '{{name}}' ይሰረዝ?",
    notFound: "ካርታው አልተገኘም",
    viewerTitle: "የገባ ካርታ",
  },
  import: {
    title: "ካርታ አስመጣ",
    analyzing: "የፋይሉ ጂኦሪፈረንስ በመነበብ ላይ...",
    errorReading: "ፋይሉን በማንበብ ላይ ስህተት፦ {{details}}",
    notGeoreferenced: "ፋይሉ ጂኦሪፈረንስ አልተደረገበትም፦ የካርታውን ጂኦግራፊያዊ መጋጠሚያዎች አልያዘም",
    unsupportedGeoreference:
      "የዚህ PDF ፋይል ጂኦሪፈረንስ (OGC GeoPDF ኢንኮዲንግ) ገና አይደገፍም",
    unsupportedFile: "ፋይሉ PDF ወይም GeoTIFF አይደለም",
    unsupportedGeoTiffFormat:
      "የዚህ GeoTIFF ፋይል ምስሎች አይደገፉም ({{details}})፦ ማስመጣት የሚቻለው በእያንዳንዱ ናሙና 8 ቢት ያላቸው ምስሎች ብቻ ናቸው (RGB፣ RGBA፣ ግራጫማ ወይም የቀለም ቤተ-ስዕል ያላቸው)",
    page: "ገጽ",
    pageItem: "ገጽ {{page}}",
    name: "ስም",
    maxZoom: "ከፍተኛ ማጉላት: {{value}}",
    nativeZoom: "(የካርታው ጥራት፦ {{value}})",
    maxZoomAboveNative: "ከካርታው ጥራት በላይ ያሉ የማጉላት ደረጃዎች ደብዛዛ ሆነው ይታያሉ",
    estimate: "{{tiles}} ታይሎች · ~{{size}} (ነፃ ቦታ፦ {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} ታይሎች፦ በጣም ብዙ (ከፍተኛ {{maxTiles}})፤ ከፍተኛውን ማጉላት ይቀንሱ",
    tooManyTiles:
      "በጣም ብዙ ታይሎች፦ ቢበዛ {{maxTiles}} ታይሎች ብቻ ሊፈጠሩ ይችላሉ፤ ከፍተኛውን ማጉላት ይቀንሱ",
    notEnoughSpace: "በመሣሪያው ላይ በቂ ነፃ ቦታ የለም",
    lowSpaceConfirm: {
      title: "ዝቅተኛ ነፃ ቦታ",
      message:
        "ካርታው ወደ {{size}} ገደማ ይጠቀማል፣ ይህም የመሣሪያው ነፃ ቦታ ({{freeSpace}}) {{percent}}% ነው። ይቀጥሉ?",
    },
    preview: {
      rendering: "ቅድመ እይታ በመፍጠር ላይ...",
      lowResolution:
        "ዝቅተኛ ጥራት ያለው ቅድመ እይታ (የማጉላት ደረጃዎች {{minZoom}} - {{maxZoom}})",
      error: "ቅድመ እይታ አይገኝም፦ {{details}}",
    },
    importButton: "አስመጣ",
    jobTitle: "ካርታውን በማስመጣት ላይ",
    complete: "ካርታው ገብቷል ({{size}})",
    error: "ካርታውን በማስመጣት ላይ ስህተት፦ {{details}}",
  },
  validation: {
    nameRequired: "ስም ያስፈልጋል",
    nameDuplicate: "ስሙ በሌላ የገባ ካርታ ጥቅም ላይ ውሏል",
  },
};
