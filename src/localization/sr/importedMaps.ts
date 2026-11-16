export default {
  title: "Uvezene mape",
  description:
    "Uvezite mape iz geoprostornih (georeferenciranih) PDF ili GeoTIFF fajlova sačuvanih na ovom uređaju: prikazuju se preko osnovne mape na svim mapama u aplikaciji, čak i bez internet veze.",
  rendererNotAvailable:
    "Ova verzija aplikacije ne podržava uvezene mape: ažurirajte je na najnoviju verziju",
  importMap: "Uvezi mapu",
  noMaps: "Još nije uvezena nijedna mapa",
  storage: {
    used: "Prostor koji zauzimaju uvezene mape:",
  },
  opacity: "Neprozirnost: {{value}}%",
  hideBaseMap: "Samo uvezena mapa",
  map: {
    fileName: "Fajl: {{fileName}}",
    page: "Stranica: {{page}}",
    zoomLevels: "Nivoi zumiranja: {{minZoom}} - {{maxZoom}}",
    tiles: "Pločice: {{count}}",
    size: "Veličina: {{size}} (PDF fajl: {{sourceSize}})",
    sizeTilesOnly: "Veličina: {{size}}",
    datumWarning:
      "Datum mape nije WGS84: mapa može biti pomjerena za nekoliko metara",
    visible: "Prikaži na mapama",
    deleteConfirm: "Obrisati mapu '{{name}}'?",
    notFound: "Mapa nije pronađena",
    viewerTitle: "Uvezena mapa",
  },
  import: {
    title: "Uvezi mapu",
    analyzing: "Čitanje georeferenciranja fajla...",
    errorReading: "Greška pri čitanju fajla: {{details}}",
    notGeoreferenced:
      "Fajl nije georeferenciran: ne sadrži geografske koordinate mape",
    unsupportedGeoreference:
      "Georeferenciranje ovog PDF fajla (OGC GeoPDF kodiranje) još nije podržano",
    unsupportedFile: "Fajl nije ni PDF ni GeoTIFF",
    unsupportedGeoTiffFormat:
      "Slike ovog GeoTIFF fajla nisu podržane ({{details}}): mogu se uvesti samo slike sa 8 bita po uzorku (RGB, RGBA, nijanse sive ili sa paletom boja)",
    page: "Stranica",
    pageItem: "Stranica {{page}}",
    name: "Naziv",
    maxZoom: "Maksimalno zumiranje: {{value}}",
    nativeZoom: "(rezolucija mape: {{value}})",
    maxZoomAboveNative: "Nivoi zumiranja iznad rezolucije mape izgledaće mutno",
    estimate:
      "Pločice: {{tiles}} · ~{{size}} (slobodan prostor: {{freeSpace}})",
    estimateTooManyTiles:
      "Pločice: {{tiles}}, previše (najviše {{maxTiles}}); smanjite maksimalno zumiranje",
    tooManyTiles:
      "Previše pločica: može se generisati najviše {{maxTiles}} pločica; smanjite maksimalno zumiranje",
    notEnoughSpace: "Nema dovoljno slobodnog prostora na uređaju",
    lowSpaceConfirm: {
      title: "Malo slobodnog prostora",
      message:
        "Mapa će zauzeti oko {{size}}, {{percent}}% slobodnog prostora na uređaju ({{freeSpace}}). Nastaviti?",
    },
    preview: {
      rendering: "Iscrtavanje pregleda...",
      lowResolution:
        "Pregled u niskoj rezoluciji (nivoi zumiranja {{minZoom}} - {{maxZoom}})",
      error: "Pregled nije dostupan: {{details}}",
    },
    importButton: "Uvezi",
    jobTitle: "Uvoz mape",
    complete: "Mapa je uvezena ({{size}})",
    error: "Greška pri uvozu mape: {{details}}",
  },
  validation: {
    nameRequired: "Naziv je obavezan",
    nameDuplicate: "Naziv već koristi druga uvezena mapa",
  },
};
