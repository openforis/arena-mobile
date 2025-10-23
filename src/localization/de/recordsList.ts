export default {
  cloneRecords: {
    title: "Klonen",
    confirm: {
      message:
        "Die ausgewählten {{recordsCount}} Datensätze in den Zyklus {{cycle}} klonen?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Nur Datensätze, die im Gerät importiert oder lokal geändert wurden, können in den nächsten Zyklus geklont werden",
    completeSuccessfully:
      "Datensätze erfolgreich in den Zyklus {{cycle}} geklont!",
  },
  confirmImportRecordFromServer: "Datensatz vom Server importieren?",
  continueEditing: {
    title: "Bearbeitung fortsetzen",
    confirm: {
      message: "Bearbeitung dort fortsetzen, wo Sie aufgehört haben?",
    },
  },
  dateModifiedRemotely: "Datum der Remote-Änderung",
  deleteRecordsConfirm: {
    title: "Datensätze löschen",
    message: "Die ausgewählten Datensätze löschen?",
  },
  duplicateKey: {
    title: "Doppelter Schlüssel",
    message: `Ein anderer Datensatz mit demselben Schlüssel ({{keyValues}}) ist bereits vorhanden.`,
  },
  exportRecords: {
    title: "Exportieren",
  },
  importRecord: "Datensatz importieren",
  importRecords: {
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "Datensätze können nicht importiert werden: Diese Umfrage sollte in Arena Mobile nicht sichtbar sein",
      recordsDownloadNotAllowed:
        "Das Importieren von Datensätzen vom Arena-Server ist nicht erlaubt",
    },
  },
  importRecordsFromFile: {
    title: "Importieren",
    confirmMessage: `Datensätze aus der ausgewählten Datei importieren
  {{fileName}}?`,
    invalidFileType: "Ungültiger Dateityp (erwartet wird .zip)",
    overwriteExistingRecords: "Vorhandene Datensätze überschreiben",
    selectFile: "Datei auswählen",
  },
  importCompleteSuccessfully: `Datensatzimport erfolgreich abgeschlossen!
  - {{processedRecords}} Datensätze verarbeitet
  - {{insertedRecords}} Datensätze eingefügt
  - {{updatedRecords}} Datensätze aktualisiert`,
  importFailed: "Datensatzimport fehlgeschlagen: {{details}}",
  loadStatus: {
    title: "Geladen",
    C: "Vollständig",
    P: "Teilweise (ohne Dateien)",
    S: "Nur Zusammenfassung",
  },
  origin: { title: "Herkunft", L: "Lokal", R: "Remote" },
  owner: "Eigentümer",
  sendData: {
    error: {
      generic: "Daten können nicht an den Server gesendet werden: {{details}}",
      surveyNotVisibleInMobile:
        "Die aktuelle Umfrage sollte in Arena Mobile nicht sichtbar sein",
      recordsUploadNotAllowed:
        "Das Hochladen von Datensätzen auf den Server ist nicht erlaubt",
      recordsWithErrorsUploadNotAllowed:
        "Das Hochladen von Datensätzen mit Validierungsfehlern auf den Server ist nicht erlaubt",
    },
  },
};
