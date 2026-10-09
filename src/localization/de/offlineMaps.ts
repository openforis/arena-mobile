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
  customLayers: {
    title: "Benutzerdefinierte Kartenebenen",
    description:
      "Füge Kartenebenen anderer Kachelanbieter hinzu (XYZ-Rasterkacheln), mit einem API-Schlüssel, falls der Anbieter ihn verlangt. Sie können in den Einstellungen als Standard-Kartenebene und mit der Ebenen-Schaltfläche auf der Karte ausgewählt werden. Stelle sicher, dass die Nutzungsbedingungen des Anbieters dies erlauben.",
    add: "Ebene hinzufügen",
    noLayers: "Noch keine benutzerdefinierten Kartenebenen definiert",
    maxZoom: "Max. Zoom: {{value}}",
    deleteConfirm:
      "Die benutzerdefinierte Kartenebene '{{name}}' und ihre auf diesem Gerät gespeicherten Kartenkacheln löschen?",
    editor: {
      title: "Benutzerdefinierte Kartenebene",
      name: "Name",
      url: "URL-Vorlage",
      urlHint:
        "Beispiel: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} und {z} sind erforderlich; {apiKey} wird durch den API-Schlüssel ersetzt.",
      apiKey: "API-Schlüssel (optional)",
      apiKeyHint:
        "Wird im sicheren Speicher des Geräts abgelegt und nur in den Anfragen an den Kachelanbieter verwendet.",
      attribution: "Quellenangabe (optional)",
      attributionHint:
        "Vom Anbieter verlangter Urheberrechtshinweis; er wird auf der Karte angezeigt.",
      test: {
        label: "Testen",
        success: "Kartenkachel erfolgreich heruntergeladen",
        errorStatus:
          "Der Kachelanbieter hat keine Kartenkachel zurückgegeben (HTTP-Status: {{status}}); überprüfe die URL-Vorlage und den API-Schlüssel",
        errorNotReachable:
          "Der Kachelanbieter ist nicht erreichbar; überprüfe die URL-Vorlage und die Internetverbindung",
      },
    },
    validation: {
      nameRequired: "Name ist erforderlich",
      nameDuplicate: "Name wird bereits von einer anderen Ebene verwendet",
      urlRequired: "URL-Vorlage ist erforderlich",
      urlNotHttps: "Die URL-Vorlage muss mit https:// beginnen",
      urlPlaceholdersMissing:
        "Die URL-Vorlage muss die Platzhalter {x}, {y} und {z} enthalten",
      urlSubdomainNotSupported:
        "Der Platzhalter {s} wird nicht unterstützt: ersetze ihn durch eine der Subdomains des Anbieters (z. B. 'a')",
      apiKeyRequired:
        "Die URL-Vorlage enthält {apiKey}: der API-Schlüssel ist erforderlich",
      apiKeyPlaceholderMissing:
        "Füge den Platzhalter {apiKey} an der Stelle in die URL-Vorlage ein, an der der API-Schlüssel erwartet wird",
    },
  },
  mapTypes: {
    standard: "Standard",
    satellite: "Satellit",
    hybrid: "Hybrid",
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
    nameRequired: "Der Name ist erforderlich",
    nameDuplicate: "Der Name wird bereits von einem anderen Gebiet verwendet",
  },
  areaEditor: {
    title: "Neues Offline-Kartengebiet",
    name: "Name",
    layer: "Ebene",
    maxZoom: "Max. Zoom: {{value}}",
    currentZoom: "Aktueller Zoom: {{value}}",
    surface: "Fläche: {{area}}",
    drawAreaToEstimate:
      "Zeichnen Sie das Interessengebiet auf der Karte, um den benötigten Speicherplatz zu sehen",
    estimate: "{{tiles}} Kacheln · ~{{size}} (freier Speicher: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} Kacheln: zu viele (max. {{maxTiles}}); verkleinern Sie das Gebiet oder den max. Zoom",
    tooManyTiles:
      "Das Gebiet ist zu groß: Es können höchstens {{maxTiles}} Kacheln heruntergeladen werden; verkleinern Sie das Gebiet oder den max. Zoom",
    notEnoughSpace: "Nicht genügend freier Speicher auf dem Gerät",
    lowSpaceConfirm: {
      title: "Wenig freier Speicher",
      message:
        "Der Download belegt etwa {{size}}, {{percent}} % des freien Speichers auf dem Gerät ({{freeSpace}}). Fortfahren?",
    },
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
