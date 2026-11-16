export default {
  title: "PDF mape",
  description:
    "Uvezite mape iz geoprostornih (georeferenciranih) PDF fajlova sačuvanih na ovom uređaju: prikazuju se preko osnovne mape na svim mapama u aplikaciji, čak i bez internet veze.",
  rendererNotAvailable:
    "Ova verzija aplikacije ne podržava PDF mape: ažurirajte je na najnoviju verziju",
  importPdf: "Uvezi PDF",
  noMaps: "Još nije uvezena nijedna PDF mapa",
  storage: {
    used: "Prostor koji zauzimaju PDF mape:",
  },
  opacity: "Neprozirnost: {{value}}%",
  hideBaseMap: "Samo PDF",
  map: {
    fileName: "Fajl: {{fileName}}",
    page: "Stranica: {{page}}",
    zoomLevels: "Nivoi zumiranja: {{minZoom}} - {{maxZoom}}",
    tiles: "Pločice: {{count}}",
    size: "Veličina: {{size}} (PDF fajl: {{sourceSize}})",
    datumWarning:
      "Datum mape nije WGS84: mapa može biti pomjerena za nekoliko metara",
    visible: "Prikaži na mapama",
    deleteConfirm: "Obrisati PDF mapu '{{name}}'?",
    notFound: "PDF mapa nije pronađena",
    viewerTitle: "PDF mapa",
  },
  import: {
    title: "Uvezi PDF mapu",
    analyzing: "Čitanje georeferenciranja PDF fajla...",
    errorReading: "Greška pri čitanju PDF fajla: {{details}}",
    notGeoreferenced:
      "PDF fajl nije georeferenciran: ne sadrži geografske koordinate mape",
    unsupportedGeoreference:
      "Georeferenciranje ovog PDF fajla (OGC GeoPDF kodiranje) još nije podržano",
    page: "Stranica",
    pageItem: "Stranica {{page}}",
    name: "Naziv",
    maxZoom: "Maksimalno zumiranje: {{value}}",
    nativeZoom: "(rezolucija PDF-a: {{value}})",
    maxZoomAboveNative:
      "Nivoi zumiranja iznad rezolucije PDF-a izgledaće mutno",
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
    jobTitle: "Uvoz PDF mape",
    complete: "PDF mapa je uvezena ({{size}})",
    error: "Greška pri uvozu PDF mape: {{details}}",
  },
  validation: {
    nameRequired: "Naziv je obavezan",
    nameDuplicate: "Naziv već koristi druga PDF mapa",
  },
};
