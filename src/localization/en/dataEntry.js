export default {
  confirmGoToListOfRecords: `Go to list of records?

(all changes already saved)`,
  checkSyncStatus: "Check sync status",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Find closest sampling point",
    findingClosestSamplingPoint: "Finding closest sampling point",
    minDistanceItemFound: "Item found at a distance of {{minDistance}}m",
    minDistanceItemFound_plural:
      "Items found at a distance of {{minDistance}}m",
    useSelectedItem: "Use selected item",
  },
  confirmDeleteSelectedItems: {
    message: "Delete the selected items?",
  },
  confirmDeleteValue: {
    message: "Delete this value?",
  },
  confirmOverwriteValue: {
    message: "Overwrite existing value?",
  },
  cycle: "Cycle",
  cycleForNewRecords: "Cycle for new records:",
  options: "Options",
  editNodeDef: "Edit {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Error fetching records from server.

Check connection settings.

Details: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Error generating records export file: {{details}}",
  errorLoadingRecords: "Error loading records: {{details}}",
  exportData: {
    title: "Export data",
    confirm: {
      title: "Confirm export data",
      message: `Records to export:
- {{newRecordsCount}} new records;
- {{updatedRecordsCount}} updated records
- {{conflictingRecordsCount}} conflicting records`,
    },
    noRecordsInDeviceToExport: "No records in the device to export",
    onlyNewOrUpdatedRecords: "Export only new or updated records",
    mergeConflictingRecords: "Merge conflicting records (same keys)",
    onlyRecordsInRemoteServerCanBeImported:
      "Only records already in remote server or records that have been updated remotely can be imported",
  },
  exportNewOrUpdatedRecords: "Export new or updated records",
  formLanguage: "Form language:",
  noEntitiesDefined: "No entities defined",
  goToDataEntry: "Go to data entry",
  goToListOfRecords: "Go to list of records",
  gpsLockingEnabledWarning: "Warning: GPS locking enabled!",
  listOfRecords: "List of records",
  localBackup: "Local backup",
  newRecord: "New",
  noRecordsFound: "No records found",
  recordEditor: "Record editor",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Show values from previous cycle",
      message: "Select previous cycle:",
      cycleItem: "Cycle {{cycleLabel}}",
    },
    foundMessage: "Record in previous cycle found!",
    notFoundMessage:
      "Record in cycle {{cycle}} with keys {{keyValues}} not found",
    confirmFetchRecordInCycle:
      "Record in cycle {{cycle}} with keys {{keyValues}} not fully loaded; download it from the server?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): fetch the list of records from the server and try again?",
    fetchError: "Error fetching record in previuos cycle: {{details}}",
    multipleRecordsFound:
      "Multiple records with keys {{keyValues}} found in cycle {{cycle}}",

    valuePanelHeader: "Value in cycle {{prevCycle}}",
  },
  sendData: "Send data",
  showOnlyLocalRecords: "Show only local records",
  syncedOn: "Synced on",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys: "Record with same key(s) already exists",
    keysNotSpecified: `Key(s) not specified`,
    new: "New (not uploaded yet)",
    notModified: "Not modified (no changes to upload)",
    modifiedLocally: "Modified locally",
    modifiedRemotely: "Modified in remote server",
    notInEntryStepAnymore:
      "Not in entry step anymore (in cleansing or analysis step)",
  },

  validationReport: {
    title: "Validation report",
    noErrorsFound: "Kudos, no errors found!",
  },

  viewModeLabel: "View mode",
  viewMode: {
    form: "Form",
    oneNode: "One node",
  },

  code: {
    selectItem: "Select item",
    selectItem_plural: "Select items",
  },
  coordinate: {
    accuracy: "Accuracy (m)",
    altitude: "Altitude (m)",
    altitudeAccuracy: "Altitude accuracy (m)",
    angleToTargetLocation: "Angle to target",
    confirmConvertCoordinate:
      "Convert coordinate from SRS {{srsFrom}} to SRS {{srsTo}}?",
    convert: "Convert",
    currentLocation: "Current location",
    distance: "Distance (m)",
    getLocation: "Get location",
    heading: "Heading (deg)",
    keepXAndY: "Keep X and Y",
    magnetometerNotAvailable: "Magnetometer not available!",
    navigateToTarget: "Navigate to target",
    srs: "$t(common:srs)",
    useCurrentLocation: "Use current location",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Search taxon",
    taxonNotSelected: "--- Taxon not selected ---",
  },
  fileAttribute: {
    chooseAudio: "Choose an audio file",
    chooseFile: "Choose a file",
    choosePicture: "Choose a picture",
    chooseVideo: "Choose a video",
    deleteConfirmMessage: "Delete the existing file?",
  },
  fileAttributeImage: {
    imagePreview: "Image preview",
    pictureResizedToSize: "Picture resized to {{size}}",
    resolution: "Resolution",
  },
  dataExport: {
    error: "Error exporting data. Details: {{details}}",
    selectTarget: "Select export target",
    selectTargetMessage: `Select the target of the export:`,
    target: {
      remote: "Remote server",
      local: "Local folder (Download)",
      share: "Share file",
    },
    shareExportedFile: "Share exported file",
  },
  location: {
    gettingCurrentLocation: "Getting current location",
    usingCurrentLocation: "Using current location",
  },
  unlock: {
    label: "Unlock",
    confirmMessage: "Record edit is locked; unlock it?",
    confirmTitle: "Edit is locked",
  },
};
