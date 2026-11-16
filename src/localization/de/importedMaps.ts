export default {
  title: "PDF-Karten",
  description:
    "Importiere Karten aus raumbezogenen (georeferenzierten) PDF-Dateien, die auf diesem Gerät gespeichert sind: Sie werden in allen Karten der App über der Basiskarte angezeigt, auch ohne Internetverbindung.",
  rendererNotAvailable:
    "PDF-Karten werden von dieser App-Version nicht unterstützt: Aktualisiere sie auf die neueste Version",
  importPdf: "PDF importieren",
  noMaps: "Noch keine PDF-Karten importiert",
  storage: {
    used: "Von PDF-Karten belegter Speicher:",
  },
  opacity: "Deckkraft: {{value}} %",
  hideBaseMap: "Nur PDF",
  map: {
    fileName: "Datei: {{fileName}}",
    page: "Seite: {{page}}",
    zoomLevels: "Zoomstufen: {{minZoom}} - {{maxZoom}}",
    tiles: "Kacheln: {{count}}",
    size: "Größe: {{size}} (PDF-Datei: {{sourceSize}})",
    datumWarning:
      "Das Datum der Karte ist nicht WGS84: Die Karte kann um einige Meter verschoben sein",
    visible: "Auf Karten anzeigen",
    deleteConfirm: "PDF-Karte '{{name}}' löschen?",
    notFound: "PDF-Karte nicht gefunden",
    viewerTitle: "PDF-Karte",
  },
  import: {
    title: "PDF-Karte importieren",
    analyzing: "Georeferenzierung der PDF-Datei wird gelesen...",
    errorReading: "Fehler beim Lesen der PDF-Datei: {{details}}",
    notGeoreferenced:
      "Die PDF-Datei ist nicht georeferenziert: Sie enthält nicht die geografischen Koordinaten der Karte",
    unsupportedGeoreference:
      "Die Georeferenzierung dieser PDF-Datei (OGC-GeoPDF-Kodierung) wird noch nicht unterstützt",
    page: "Seite",
    pageItem: "Seite {{page}}",
    name: "Name",
    maxZoom: "Max. Zoom: {{value}}",
    nativeZoom: "(PDF-Auflösung: {{value}})",
    maxZoomAboveNative:
      "Zoomstufen oberhalb der PDF-Auflösung werden unscharf dargestellt",
    estimate: "{{tiles}} Kacheln · ~{{size}} (freier Speicher: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} Kacheln: zu viele (max. {{maxTiles}}); verringere den max. Zoom",
    tooManyTiles:
      "Zu viele Kacheln: Es können höchstens {{maxTiles}} Kacheln erzeugt werden; verringere den max. Zoom",
    notEnoughSpace: "Nicht genügend freier Speicher auf dem Gerät",
    lowSpaceConfirm: {
      title: "Wenig freier Speicher",
      message:
        "Die Karte belegt etwa {{size}}, {{percent}} % des freien Speichers auf dem Gerät ({{freeSpace}}). Fortfahren?",
    },
    preview: {
      rendering: "Vorschau wird erstellt...",
      lowResolution:
        "Vorschau in niedriger Auflösung (Zoomstufen {{minZoom}} - {{maxZoom}})",
      error: "Vorschau nicht verfügbar: {{details}}",
    },
    importButton: "Importieren",
    jobTitle: "PDF-Karte wird importiert",
    complete: "PDF-Karte importiert ({{size}})",
    error: "Fehler beim Importieren der PDF-Karte: {{details}}",
  },
  validation: {
    nameRequired: "Name ist erforderlich",
    nameDuplicate: "Name wird bereits von einer anderen PDF-Karte verwendet",
  },
};
