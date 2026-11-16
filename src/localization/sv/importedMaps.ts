export default {
  title: "Importerade kartor",
  description:
    "Importera kartor från geospatiala (georefererade) PDF- eller GeoTIFF-filer som finns på den här enheten: de visas ovanpå bakgrundskartan i alla appens kartor, även utan internetanslutning.",
  rendererNotAvailable:
    "Importerade kartor stöds inte av den här versionen av appen: uppdatera den till den senaste versionen",
  importMap: "Importera karta",
  supportedFormats:
    "Filer som stöds: geospatial PDF (.pdf) och GeoTIFF (.tif, .tiff)",
  noMaps: "Inga kartor har importerats ännu",
  storage: {
    used: "Utrymme som används av importerade kartor:",
  },
  opacity: "Opacitet: {{value}} %",
  hideBaseMap: "Endast importerad karta",
  map: {
    fileName: "Fil: {{fileName}}",
    page: "Sida: {{page}}",
    zoomLevels: "Zoomnivåer: {{minZoom}} - {{maxZoom}}",
    tiles: "Kartrutor: {{count}}",
    size: "Storlek: {{size}} (PDF-fil: {{sourceSize}})",
    sizeTilesOnly: "Storlek: {{size}}",
    datumWarning:
      "Kartans datum är inte WGS84: kartan kan vara förskjuten med några meter",
    visible: "Visa på kartor",
    deleteConfirm: "Ta bort kartan '{{name}}'?",
    notFound: "Kartan hittades inte",
    viewerTitle: "Importerad karta",
  },
  import: {
    title: "Importera karta",
    analyzing: "Läser filens georeferering...",
    errorReading: "Fel vid läsning av filen: {{details}}",
    notGeoreferenced:
      "Filen är inte georefererad: den innehåller inte kartans geografiska koordinater",
    unsupportedGeoreference:
      "Georefereringen i den här PDF-filen (OGC GeoPDF-kodning) stöds inte ännu",
    unsupportedFile: "Filen är varken en PDF- eller en GeoTIFF-fil",
    unsupportedGeoTiffFormat:
      "Bilderna i den här GeoTIFF-filen stöds inte ({{details}}): endast bilder med 8 bitar per sampel (RGB, RGBA, gråskala eller med färgpalett) kan importeras",
    page: "Sida",
    pageItem: "Sida {{page}}",
    name: "Namn",
    maxZoom: "Max zoom: {{value}}",
    nativeZoom: "(kartans upplösning: {{value}})",
    maxZoomAboveNative:
      "Zoomnivåer över kartans upplösning kommer att se suddiga ut",
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
    jobTitle: "Importerar kartan",
    complete: "Karta importerad ({{size}})",
    error: "Fel vid import av kartan: {{details}}",
  },
  validation: {
    nameRequired: "Namn krävs",
    nameDuplicate: "Namnet används redan av en annan importerad karta",
  },
};
