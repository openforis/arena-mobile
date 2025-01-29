export default {
  cloneRecords: {
    title: "Clone",
    confirm: {
      message:
        "Clone the selected {{recordsCount}} records into cycle {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Only records imported in device or modified locally can be cloned into next cycle",
    completeSuccessfully: "Records cloned successfully into cycle {{cycle}}!",
  },
  confirmImportRecordFromServer: "Import record from server?",
  dateModifiedRemotely: "Date modified remotely",
  deleteRecordsConfirm: {
    title: "Delete records",
    message: "Delete the selected records?",
  },
  duplicateKey: {
    title: "Duplicate key",
    message: `Another record with the same key ({{keyValues}}) already exists.`,
  },
  exportRecords: {
    title: "Export",
  },
  importRecord: "Import record",
  importRecords: {
    title: "Import from server",
  },
  importRecordsFromFile: {
    title: "Import",
    confirmMessage: `Import records from selected file
{{fileName}}?`,
    invalidFileType: "Invalid file type (expected .zip)",
    overwriteExistingRecords: "Overwrite existing records",
    selectFile: "Select file",
  },
  importCompleteSuccessfully: `Records import complete successfully!
- {{processedRecords}} records processed
- {{insertedRecords}} records inserted
- {{updatedRecords}} records updated`,
  importFailed: "Records import failed: {{details}}",
  loadStatus: {
    title: "Loaded",
    C: "Complete",
    P: "Partial (without files)",
    S: "Only summary",
  },
  origin: { title: "Origin", L: "Local", R: "Remote" },
  owner: "Owner",
};
