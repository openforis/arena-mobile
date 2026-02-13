import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords: `Go to list of records?

(all changes already saved)`,
  checkStatus: "Check status",
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
  confirmUpdateDependentEnumeratedEntities: {
    message: `If you continue, some enumerated entities ({{entityDefs}}) will be re-enumerated, deleting the existing values inserted into them (if any).  
  
Update the enumerated entities?`,
    title: "Update enumerated entities",
  },
  cycle: "Cycle",
  cycleForNewRecords: "Cycle for new records:",
  dataExport: {
    confirm: {
      title: "Confirm export data",
      message: `Records to export:
{{recordsCountSummary}}`,
      selectOptions: `Select export options:`,
    },

    error: "Error exporting data. Details: {{details}}",
    exportedSuccessfullyButFilesMissing: `Data exported successfully but {{missingFiles}} files/images are missing or broken.
Please check your records and check also records on the server`,
    exportingData: "Exporting data...",
    exportToCsv: "Export to CSV",
    mergeConflictingRecords: "Merge conflicting records (same keys)",
    noRecordsInDeviceToExport: "No records in the device to export",
    onlyNewOrUpdatedRecords: "Export only new or updated records",
    onlyRecordsInRemoteServerCanBeImported:
      "Only records already in remote server or records that have been updated remotely can be imported",
    option: {
      [FlatDataExportOption.addCycle]: "Add cycle",
      [FlatDataExportOption.includeAncestorAttributes]: "Ancestor attributes",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Category items labels",
      [FlatDataExportOption.includeFiles]: "File attributes",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Taxon scientific name",
    },
    selectTarget: "Select export target",
    selectTargetMessage: `Select the target of the export:`,
    shareExportedFile: "Share exported file",
    target: {
      remote: "Remote server",
      local: "Local folder (Download)",
      share: "$t(common:shareFile)",
    },
    title: "Export data",
  },
  editNodeDef: "Edit {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Error fetching records from server.

Check connection settings.

Details: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Error generating records export file: {{details}}",
  errorLoadingRecords: "Error loading records: {{details}}",
  exportNewOrUpdatedRecords: "Export new or updated records",
  formLanguage: "Form language:",
  node: {
    cannotAddMoreItems: {
      maxCountReached: `Cannot add more items: 
max count reached`,
    },
  },
  noEntitiesDefined: "No entities defined",
  goToDataEntry: "Go to data entry",
  goToListOfRecords: "Go to list of records",
  gpsLockingEnabledWarning: "Warning: GPS locking enabled!",
  listOfRecords: "Records",
  localBackup: "Local backup",
  newRecord: "New",
  noRecordsFound: "No records found",
  options: "Options",
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
    confirmFetchRecordInCycle: `Record in cycle {{cycle}} with keys {{keyValues}} not fully loaded.
Download it from the server?`,
    confirmSyncRecordsSummaryAndTryAgain: `$t(dataEntry:recordInPreviousCycle.notFoundMessage).
Fetch the list of records from the server and try again?`,
    fetchError: "Error fetching record in previuos cycle: {{details}}",
    multipleRecordsFound:
      "Multiple records with keys {{keyValues}} found in cycle {{cycle}}",
    valuePanelHeader: "Value in cycle {{prevCycle}}",
  },
  recordStatus: {
    new: "new",
    updated: "updated",
    conflicting: "conflicting",
    withValidationErrors: "with validation errors",
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
  uploadingData: {
    title: "Uploading data",
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
    pictureResizedToSize: `Picture resized to {{size}}.
Maximum size allowed: {{maxSizeMB}}MB.
Check settings or ask the survey administrator to change this limit.`,
    resolution: "Resolution",
    rotate: "Rotate",
    rotationError: "Error rotating image: {{error}}",
  },
  location: {
    label: "Location",
    gettingCurrentLocation: "Getting current location",
    usingCurrentLocation: "Using current location",
  },
  unlock: {
    label: "Unlock",
    confirmMessage: "Record edit is locked; unlock it?",
    confirmTitle: "Edit is locked",
  },
};
