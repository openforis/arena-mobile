import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords: `Zur Datensatzliste wechseln?
  
  (Alle Änderungen bereits gespeichert)`,
  checkStatus: "Status prüfen",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Nächsten Probenahmepunkt finden",
    findingClosestSamplingPoint: "Nächsten Probenahmepunkt wird gesucht",
    minDistanceItemFound:
      "Element in einer Entfernung von {{minDistance}}m gefunden",
    minDistanceItemFound_plural:
      "Elemente in einer Entfernung von {{minDistance}}m gefunden",
    useSelectedItem: "Ausgewähltes Element verwenden",
  },
  confirmDeleteSelectedItems: {
    message: "Ausgewählte Elemente löschen?",
  },
  confirmDeleteValue: {
    message: "Diesen Wert löschen?",
  },
  confirmOverwriteValue: {
    message: "Vorhandenen Wert überschreiben?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Wenn Sie fortfahren, werden einige abhängige, aufgezählte Entitäten ({{entityDefs}}) neu nummeriert, wodurch die bestehenden, eingegebenen Werte (falls vorhanden) gelöscht werden.\n\nMöchten Sie die aufgezählten Entitäten aktualisieren?",
    title: "Aufgezählte Entitäten aktualisieren",
  },
  cycle: "Zyklus",
  cycleForNewRecords: "Zyklus für neue Datensätze:",
  options: "Optionen",
  editNodeDef: "{{nodeDef}} bearbeiten",
  errorFetchingRecordsSyncStatus: `Fehler beim Abrufen von Datensätzen vom Server.
  
  Verbindungseinstellungen prüfen.
  
  Details: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Fehler beim Erstellen der Exportdatei für Datensätze: {{details}}",
  errorLoadingRecords: "Fehler beim Laden von Datensätzen: {{details}}",
  exportNewOrUpdatedRecords: "Neue oder aktualisierte Datensätze exportieren",
  formLanguage: "Formularsprache:",
  noEntitiesDefined: "Keine Entitäten definiert",
  goToDataEntry: "Zur Dateneingabe gehen",
  goToListOfRecords: "Zur Datensatzliste gehen",
  gpsLockingEnabledWarning: "Warnung: GPS-Ortung aktiviert!",
  listOfRecords: "Datensatzliste",
  localBackup: "Lokale Sicherung",
  newRecord: "Neu",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Es können keine weiteren Artikel hinzugefügt werden: maximale Anzahl erreicht",
    },
    cannotDeleteNode: {
      noNodeFound: "Knoten kann nicht gelöscht werden: kein Knoten gefunden",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Wert kann nicht aktualisiert werden: kein Knoten gefunden",
    },
  },
  noRecordsFound: "Keine Datensätze gefunden",
  recordEditor: "Datensatzbearbeitung",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Werte aus dem vorherigen Zyklus anzeigen",
      message: "Vorherigen Zyklus auswählen:",
      cycleItem: "Zyklus {{cycleLabel}}",
    },
    foundMessage: "Datensatz im vorherigen Zyklus gefunden!",
    notFoundMessage:
      "Datensatz im Zyklus {{cycle}} mit den Schlüsseln {{keyValues}} nicht gefunden",
    confirmFetchRecordInCycle:
      "Datensatz im Zyklus {{cycle}} mit den Schlüsseln {{keyValues}} nicht vollständig geladen; vom Server herunterladen?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): Liste der Datensätze vom Server abrufen und erneut versuchen?",
    fetchError:
      "Fehler beim Abrufen des Datensatzes im vorherigen Zyklus: {{details}}",
    multipleRecordsFound:
      "Mehrere Datensätze mit den Schlüsseln {{keyValues}} im Zyklus {{cycle}} gefunden",

    valuePanelHeader: "Wert im Zyklus {{prevCycle}}",
  },
  recordStatus: {
    new: "neu",
    updated: "aktualisiert",
    conflicting: "konfliktbehaftet",
    withValidationErrors: "mit Validierungsfehlern",
  },
  sendData: "Daten senden",
  showOnlyLocalRecords: "Nur lokale Datensätze anzeigen",
  syncedOn: "Synchronisiert am",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys:
      "Datensatz mit demselben Schlüssel/denselben Schlüsseln ist bereits vorhanden",
    keysNotSpecified: `Schlüssel nicht angegeben`,
    new: "Neu (noch nicht hochgeladen)",
    notModified: "Nicht geändert (keine Änderungen zum Hochladen)",
    modifiedLocally: "Lokal geändert",
    modifiedRemotely: "Auf dem Remote-Server geändert",
    notInEntryStepAnymore:
      "Nicht mehr im Eingabeschritt (im Bereinigungs- oder Analyseschritt)",
  },
  uploadingData: {
    title: "Daten werden hochgeladen",
  },
  validationReport: {
    title: "Validierungsbericht",
    noErrorsFound: "Super, keine Fehler gefunden!",
  },

  viewModeLabel: "Ansichtsmodus",
  viewMode: {
    form: "Formular",
    oneNode: "Ein Knoten",
  },

  code: {
    selectItem: "Element auswählen",
    selectItem_plural: "Elemente auswählen",
  },
  coordinate: {
    accuracy: "Genauigkeit (m)",
    altitude: "Höhe (m)",
    altitudeAccuracy: "Höhengenauigkeit (m)",
    angleToTargetLocation: "Winkel zum Zielort",
    confirmConvertCoordinate:
      "Koordinate von SRS {{srsFrom}} in SRS {{srsTo}} konvertieren?",
    convert: "Konvertieren",
    currentLocation: "Aktueller Standort",
    distance: "Entfernung (m)",
    getLocation: "Standort abrufen",
    heading: "Richtung (Grad)",
    keepXAndY: "X und Y behalten",
    magnetometerNotAvailable: "Magnetometer nicht verfügbar!",
    navigateToTarget: "Zum Ziel navigieren",
    srs: "$t(common:srs)",
    useCurrentLocation: "Aktuellen Standort verwenden",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Taxon suchen",
    taxonNotSelected: "--- Taxon nicht ausgewählt ---",
  },
  fileAttribute: {
    selectAudio: "Audio auswählen",
    selectFile: "Datei auswählen",
    selectPicture: "Bild auswählen",
    selectVideo: "Video auswählen",
    deleteConfirmMessage: "Vorhandene Datei löschen?",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Fehler beim Starten der Audioaufnahme: {{error}}",
      pausingRecording: "Fehler beim Pausieren der Audioaufnahme: {{error}}",
      resumingRecording: "Fehler beim Fortsetzen der Audioaufnahme: {{error}}",
      savingRecording: "Fehler beim Speichern der Audioaufnahme",
      stoppingRecording: "Fehler beim Stoppen der Audioaufnahme: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Bildvorschau",
    pictureResizedToSize: `Bild auf {{size}} geändert.
Maximal zulässige Größe: {{maxSizeMB}}MB.
Überprüfen Sie die Einstellungen oder bitten Sie den Umfrageadministrator, dieses Limit zu ändern.`,
    resolution: "Auflösung",
    rotate: "Drehen",
    rotationError: "Fehler beim Drehen des Bildes: {{error}}",
  },
  dataExport: {
    confirm: {
      title: "Export von Daten bestätigen",
      message: `Zu exportierende Datensätze:
{{recordsCountSummary}}`,
      selectOptions: `Exportoptionen auswählen:`,
    },

    error: "Fehler beim Exportieren von Daten. Details: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Daten wurden erfolgreich exportiert, aber {{missingFiles}} Dateien/Bilder fehlen oder sind defekt. Bitte überprüfen Sie Ihre Aufzeichnungen und die Aufzeichnungen auf dem Server.",
    exportingData: "Exportiere Daten...",
    exportToCsv: "Nach CSV exportieren",
    mergeConflictingRecords:
      "In Konflikt stehende Datensätze zusammenführen (gleiche Schlüssel)",
    noRecordsInDeviceToExport: "Keine Datensätze auf dem Gerät zum Exportieren",
    onlyNewOrUpdatedRecords:
      "Nur neue oder aktualisierte Datensätze exportieren",
    onlyRecordsInRemoteServerCanBeImported:
      "Nur Datensätze, die bereits auf dem Remote-Server vorhanden sind oder die remote aktualisiert wurden, können importiert werden",
    option: {
      [FlatDataExportOption.addCycle]: "Zyklus hinzufügen",
      [FlatDataExportOption.includeAncestorAttributes]: "Vorfahrenattribute",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Kategorie-Elementbeschriftungen",
      [FlatDataExportOption.includeFiles]: "Dateiattribute",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Wissenschaftlicher Name des Taxons",
    },
    selectTarget: "Exportziel auswählen",
    selectTargetMessage: `Ziel des Exports auswählen:`,
    shareExportedFile: "Exportierte Datei teilen",
    target: {
      remote: "Remote-Server",
      local: "Lokaler Ordner (Download)",
      share: "$t(common:shareFile)",
    },
    title: "Daten exportieren",
  },
  location: {
    label: "Standort",
    gettingCurrentLocation: "Aktuellen Standort wird abgerufen",
    usingCurrentLocation: "Aktueller Standort wird verwendet",
  },
  unlock: {
    label: "Entsperren",
    confirmMessage: "Die Datensatzbearbeitung ist gesperrt; entsperren?",
    confirmTitle: "Bearbeitung ist gesperrt",
  },
};
