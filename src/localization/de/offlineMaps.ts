export default {
  title: "Offline-Karten",
  description:
    "Laden Sie die Karte Ihres Interessengebiets herunter, bevor Sie ins Feld gehen: Sie ist dann beim Zeichnen oder Anzeigen geografischer Attribute auch ohne Internetverbindung verfügbar.",
  freeLayersNotInUse:
    "Offline-Karten werden nur verwendet, wenn der Kartenanbieter in den Einstellungen auf 'Free map layers' gesetzt ist.",
  useFreeLayers: "Kostenlose Kartenebenen verwenden",
  offlineMode: "Offline",
  addArea: "Gebiet hinzufügen",
  deleteAll: "Alle löschen",
  deleteAllConfirm:
    "Alle Offline-Kartengebiete und alle auf diesem Gerät gespeicherten Kartenkacheln löschen?",
  clearCache: "Karten-Cache leeren",
  clearCacheConfirm:
    "Alle auf diesem Gerät gespeicherten Kartenkacheln löschen (beim Durchsuchen der Karten zwischengespeicherte Kacheln)?",
  noAreas: "Noch keine Offline-Kartengebiete heruntergeladen",
  storage: {
    used: "Von Kartenkacheln belegter Speicher (heruntergeladene Gebiete und Cache):",
    free: "Freier Speicher auf dem Gerät:",
  },
  layers: {
    esriWorldImagery: "Satellit (Esri World Imagery)",
    openTopoMap: "Topografisch (OpenTopoMap)",
    openStreetMap: "Standard (OpenStreetMap, nur online)",
  },
  area: {
    surface: "Fläche: {{area}}",
    layer: "Ebene: {{layer}}",
    zoomLevels: "Zoomstufen: {{minZoom}} - {{maxZoom}}",
    tiles: "Kacheln: {{downloaded}} / {{total}}",
    size: "Größe: {{size}}",
    lastUpdate: "Letzte Aktualisierung: {{date}}",
    missingTiles: "Fehlende Kacheln: {{count}}",
    resumeDownload: "Fehlende herunterladen",
    deleteConfirm: "Das Offline-Kartengebiet '{{name}}' löschen?",
  },
  areaEditor: {
    title: "Neues Offline-Kartengebiet",
    name: "Name",
    layer: "Ebene",
    maxZoom: "Max. Zoom: {{value}}",
    surface: "Fläche: {{area}}",
    drawAreaToEstimate:
      "Zeichnen Sie das Interessengebiet auf der Karte, um den benötigten Speicherplatz zu sehen",
    estimate: "{{tiles}} Kacheln · ~{{size}} (freier Speicher: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} Kacheln: zu viele (max. {{maxTiles}}); verkleinern Sie das Gebiet oder den max. Zoom",
    tooManyTiles:
      "Das Gebiet ist zu groß: Es können höchstens {{maxTiles}} Kacheln heruntergeladen werden; verkleinern Sie das Gebiet oder den max. Zoom",
    notEnoughSpace: "Nicht genügend freier Speicher auf dem Gerät",
  },
  areaViewer: {
    title: "Offline-Kartengebiet",
    notFound: "Offline-Kartengebiet nicht gefunden",
  },
  download: {
    label: "Herunterladen",
    title: "Kartenkacheln werden heruntergeladen",
    complete: "Offline-Kartengebiet heruntergeladen ({{size}})",
    completeWithMissingTiles:
      "Offline-Kartengebiet heruntergeladen ({{size}}); {{missingTiles}} Kacheln konnten nicht heruntergeladen werden",
    error: "Fehler beim Herunterladen des Offline-Kartengebiets: {{details}}",
  },
};
