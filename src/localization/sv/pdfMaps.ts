export default {
  title: "PDF-kartor",
  description:
    "Importera kartor från geospatiala (georefererade) PDF-filer som finns på den här enheten: de visas ovanpå bakgrundskartan i alla appens kartor, även utan internetanslutning.",
  rendererNotAvailable:
    "PDF-kartor stöds inte av den här versionen av appen: uppdatera den till den senaste versionen",
  importPdf: "Importera PDF",
  noMaps: "Inga PDF-kartor har importerats ännu",
  storage: {
    used: "Utrymme som används av PDF-kartor:",
  },
  opacity: "Opacitet: {{value}} %",
  hideBaseMap: "Endast PDF",
  map: {
    fileName: "Fil: {{fileName}}",
    page: "Sida: {{page}}",
    zoomLevels: "Zoomnivåer: {{minZoom}} - {{maxZoom}}",
    tiles: "Kartrutor: {{count}}",
    size: "Storlek: {{size}} (PDF-fil: {{sourceSize}})",
    datumWarning:
      "Kartans datum är inte WGS84: kartan kan vara förskjuten med några meter",
    visible: "Visa på kartor",
    deleteConfirm: "Ta bort PDF-kartan '{{name}}'?",
    notFound: "PDF-kartan hittades inte",
    viewerTitle: "PDF-karta",
  },
  import: {
    title: "Importera PDF-karta",
    analyzing: "Läser PDF-filens georeferering...",
    errorReading: "Fel vid läsning av PDF-filen: {{details}}",
    notGeoreferenced:
      "PDF-filen är inte georefererad: den innehåller inte kartans geografiska koordinater",
    unsupportedGeoreference:
      "Georefereringen i den här PDF-filen (OGC GeoPDF-kodning) stöds inte ännu",
    page: "Sida",
    pageItem: "Sida {{page}}",
    name: "Namn",
    maxZoom: "Max zoom: {{value}}",
    nativeZoom: "(PDF-upplösning: {{value}})",
    maxZoomAboveNative:
      "Zoomnivåer över PDF-filens upplösning kommer att se suddiga ut",
    estimate: "{{tiles}} kartrutor · ~{{size}} (ledigt utrymme: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} kartrutor: för många (max {{maxTiles}}); minska max zoom",
    tooManyTiles:
      "För många kartrutor: högst {{maxTiles}} kartrutor kan skapas; minska max zoom",
    notEnoughSpace: "Inte tillräckligt med ledigt utrymme på enheten",
    lowSpaceConfirm: {
      title: "Lite ledigt utrymme",
      message:
        "Kartan kommer att använda cirka {{size}}, {{percent}} % av enhetens lediga utrymme ({{freeSpace}}). Fortsätta?",
    },
    preview: {
      rendering: "Skapar förhandsvisning...",
      lowResolution:
        "Förhandsvisning med låg upplösning (zoomnivåer {{minZoom}} - {{maxZoom}})",
      error: "Förhandsvisning inte tillgänglig: {{details}}",
    },
    importButton: "Importera",
    jobTitle: "Importerar PDF-karta",
    complete: "PDF-karta importerad ({{size}})",
    error: "Fel vid import av PDF-kartan: {{details}}",
  },
  validation: {
    nameRequired: "Namn krävs",
    nameDuplicate: "Namnet används redan av en annan PDF-karta",
  },
};
