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
  continueEditing: {
    title: "Continue editing",
    confirm: {
      message: "Continue editing where you left off?",
    },
  },
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
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "Cannot import records: this survey should not be visible in Arena Mobile",
      recordsDownloadNotAllowed:
        "Importing records from Arena server not allowed",
    },
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
  sendData: {
    error: {
      generic: "Cannot send data to the server: {{details}}",
      surveyNotVisibleInMobile:
        "the current survey should not be visible in Arena Mobile",
      recordsUploadNotAllowed:
        "records upload from Arena Mobile to the server not allowed",
    },
  },
};
