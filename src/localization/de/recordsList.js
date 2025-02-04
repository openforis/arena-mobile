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
    title: "Vom Server importieren",
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
};
