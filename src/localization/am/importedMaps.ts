export default {
  title: "የPDF ካርታዎች",
  description:
    "በዚህ መሣሪያ ላይ ከተቀመጡ የጂኦስፓሻል (ጂኦሪፈረንስ የተደረገባቸው) PDF ፋይሎች ካርታዎችን ያስመጡ፦ የበይነመረብ ግንኙነት ባይኖርም እንኳ በመተግበሪያው ሁሉም ካርታዎች ውስጥ ከመሠረታዊ ካርታው በላይ ይታያሉ።",
  rendererNotAvailable:
    "ይህ የመተግበሪያው ስሪት የPDF ካርታዎችን አይደግፍም፦ ወደ የቅርብ ጊዜው ስሪት ያዘምኑት",
  importPdf: "PDF አስመጣ",
  noMaps: "እስካሁን ምንም የPDF ካርታ አልመጣም",
  storage: {
    used: "በPDF ካርታዎች የተያዘ ቦታ፦",
  },
  opacity: "ግልጽነት የሌለበት መጠን፦ {{value}}%",
  hideBaseMap: "PDF ብቻ",
  map: {
    fileName: "ፋይል፦ {{fileName}}",
    page: "ገጽ፦ {{page}}",
    zoomLevels: "የማጉላት ደረጃዎች፦ {{minZoom}} - {{maxZoom}}",
    tiles: "ታይሎች፦ {{count}}",
    size: "መጠን፦ {{size}} (የPDF ፋይል፦ {{sourceSize}})",
    datumWarning: "የካርታው ዳተም WGS84 አይደለም፦ ካርታው በጥቂት ሜትሮች ሊዛባ ይችላል",
    visible: "በካርታዎች ላይ አሳይ",
    deleteConfirm: "የPDF ካርታ '{{name}}' ይሰረዝ?",
    notFound: "የPDF ካርታ አልተገኘም",
    viewerTitle: "የPDF ካርታ",
  },
  import: {
    title: "የPDF ካርታ አስመጣ",
    analyzing: "የPDF ፋይሉ ጂኦሪፈረንስ በመነበብ ላይ...",
    errorReading: "የPDF ፋይሉን በማንበብ ላይ ስህተት፦ {{details}}",
    notGeoreferenced:
      "የPDF ፋይሉ ጂኦሪፈረንስ አልተደረገበትም፦ የካርታውን ጂኦግራፊያዊ መጋጠሚያዎች አልያዘም",
    unsupportedGeoreference:
      "የዚህ PDF ፋይል ጂኦሪፈረንስ (OGC GeoPDF ኢንኮዲንግ) ገና አይደገፍም",
    page: "ገጽ",
    pageItem: "ገጽ {{page}}",
    name: "ስም",
    maxZoom: "ከፍተኛ ማጉላት: {{value}}",
    nativeZoom: "(የPDF ጥራት፦ {{value}})",
    maxZoomAboveNative: "ከPDF ጥራት በላይ ያሉ የማጉላት ደረጃዎች ደብዛዛ ሆነው ይታያሉ",
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
    jobTitle: "የPDF ካርታ በማስመጣት ላይ",
    complete: "የPDF ካርታ ገብቷል ({{size}})",
    error: "የPDF ካርታውን በማስመጣት ላይ ስህተት፦ {{details}}",
  },
  validation: {
    nameRequired: "ስም ያስፈልጋል",
    nameDuplicate: "ስሙ በሌላ የPDF ካርታ ጥቅም ላይ ውሏል",
  },
};
