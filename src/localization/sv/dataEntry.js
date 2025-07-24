export default {
  confirmGoToListOfRecords: `Gå till listan med poster?
  
  (alla ändringar är redan sparade)`,
  checkStatus: "Kontrollera status",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Hitta närmaste provtagningspunkt",
    findingClosestSamplingPoint: "Söker efter närmaste provtagningspunkt",
    minDistanceItemFound: "Objekt hittat på ett avstånd av {{minDistance}}m",
    minDistanceItemFound_plural:
      "Objekt hittades på ett avstånd av {{minDistance}}m",
    useSelectedItem: "Använd valt objekt",
  },
  confirmDeleteSelectedItems: {
    message: "Ta bort de valda objekten?",
  },
  confirmDeleteValue: {
    message: "Ta bort det här värdet?",
  },
  confirmOverwriteValue: {
    message: "Skriv över befintligt värde?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Om du fortsätter kommer vissa beroende, uppräknade entiteter ({{entityDefs}}) att räknas om, vilket raderar befintliga värden som har infogats i dem (om några).\n\nVill du uppdatera de uppräknade entiteterna?",
    title: "Uppdatera uppräknade entiteter",
  },
  cycle: "Cykel",
  cycleForNewRecords: "Cykel för nya poster:",
  options: "Alternativ",
  editNodeDef: "Redigera {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Fel vid hämtning av poster från servern.
  
  Kontrollera anslutningsinställningarna.
  
  Detaljer: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Fel vid generering av exportfil för poster: {{details}}",
  errorLoadingRecords: "Fel vid laddning av poster: {{details}}",
  exportData: {
    title: "Exportera data",
    confirm: {
      title: "Bekräfta dataexport",
      message: `Poster att exportera:
  - {{newRecordsCount}} nya poster;
  - {{updatedRecordsCount}} uppdaterade poster
  - {{conflictingRecordsCount}} konflikterande poster`,
    },
    noRecordsInDeviceToExport: "Inga poster i enheten att exportera",
    onlyNewOrUpdatedRecords: "Exportera endast nya eller uppdaterade poster",
    mergeConflictingRecords: "Slå samman konflikterande poster (samma nycklar)",
    onlyRecordsInRemoteServerCanBeImported:
      "Endast poster som redan finns på fjärrservern eller poster som har uppdaterats på distans kan importeras",
  },
  exportNewOrUpdatedRecords: "Exportera nya eller uppdaterade poster",
  formLanguage: "Formulärspråk:",
  noEntitiesDefined: "Inga entiteter definierade",
  goToDataEntry: "Gå till datainmatning",
  goToListOfRecords: "Gå till listan med poster",
  gpsLockingEnabledWarning: "Varning: GPS-låsning aktiverad!",
  listOfRecords: "Poster",
  localBackup: "Lokal säkerhetskopia",
  newRecord: "Ny",
  node: {
    cannotAddMoreItems: {
      maxCountReached:
        "Kan inte lägga till fler objekt: maximalt antal har nåtts",
    },
  },
  noRecordsFound: "Inga poster hittades",
  recordEditor: "Postredigerare",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Visa värden från föregående cykel",
      message: "Välj föregående cykel:",
      cycleItem: "Cykel {{cycleLabel}}",
    },
    foundMessage: "Post i föregående cykel hittades!",
    notFoundMessage:
      "Post i cykel {{cycle}} med nycklar {{keyValues}} hittades inte",
    confirmFetchRecordInCycle:
      "Post i cykel {{cycle}} med nycklar {{keyValues}} är inte fullständigt laddad; ladda ner den från servern?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): hämta listan med poster från servern och försök igen?",
    fetchError: "Fel vid hämtning av post i föregående cykel: {{details}}",
    multipleRecordsFound:
      "Flera poster med nycklar {{keyValues}} hittades i cykel {{cycle}}",

    valuePanelHeader: "Värde i cykel {{prevCycle}}",
  },
  sendData: "Skicka data",
  showOnlyLocalRecords: "Visa endast lokala poster",
  syncedOn: "Synkroniserad den",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys: "Post med samma nyckel/nycklar finns redan",
    keysNotSpecified: `Nyckel/nycklar inte angivna`,
    new: "Ny (inte uppladdad än)",
    notModified: "Inte ändrad (inga ändringar att ladda upp)",
    modifiedLocally: "Ändrad lokalt",
    modifiedRemotely: "Ändrad på fjärrservern",
    notInEntryStepAnymore:
      "Inte längre i inmatningssteget (i rensnings- eller analyssteget)",
  },

  validationReport: {
    title: "Valideringsrapport",
    noErrorsFound: "Bra, inga fel hittades!",
  },

  viewModeLabel: "Visningsläge",
  viewMode: {
    form: "Formulär",
    oneNode: "En nod",
  },

  code: {
    selectItem: "Välj objekt",
    selectItem_plural: "Välj objekt",
  },
  coordinate: {
    accuracy: "Noggrannhet (m)",
    altitude: "Höjd (m)",
    altitudeAccuracy: "Höjdnoggrannhet (m)",
    angleToTargetLocation: "Vinkel till mål",
    confirmConvertCoordinate:
      "Konvertera koordinat från SRS {{srsFrom}} till SRS {{srsTo}}?",
    convert: "Konvertera",
    currentLocation: "Aktuell plats",
    distance: "Avstånd (m)",
    getLocation: "Hämta plats",
    heading: "Kurs (grader)",
    keepXAndY: "Behåll X och Y",
    magnetometerNotAvailable: "Magnetometer inte tillgänglig!",
    navigateToTarget: "Navigera till mål",
    srs: "$t(common:srs)",
    useCurrentLocation: "Använd aktuell plats",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Sök taxon",
    taxonNotSelected: "--- Taxon inte valt ---",
  },
  fileAttribute: {
    chooseAudio: "Välj en ljudfil",
    chooseFile: "Välj en fil",
    choosePicture: "Välj en bild",
    chooseVideo: "Välj en video",
    deleteConfirmMessage: "Ta bort befintlig fil?",
  },
  fileAttributeImage: {
    imagePreview: "Förhandsvisning av bild",
    pictureResizedToSize: `Bilden har ändrats till {{size}}.
Maximalt tillåten storlek: {{maxSizeMB}}MB.
Kontrollera inställningarna eller be undersökningsadministratören att ändra denna gräns.`,
    resolution: "Upplösning",
  },
  dataExport: {
    error: "Fel vid export av data. Detaljer: {{details}}",
    selectTarget: "Välj exportmål",
    selectTargetMessage: `Välj exportens mål:`,
    target: {
      remote: "Fjärrserver",
      local: "Lokal mapp (Nedladdning)",
      share: "$t(common:shareFile)",
    },
    shareExportedFile: "Dela exporterad fil",
  },
  location: {
    label: "Plats",
    gettingCurrentLocation: "Hämtar aktuell plats",
    usingCurrentLocation: "Använder aktuell plats",
  },
  unlock: {
    label: "Lås upp",
    confirmMessage: "Postredigering är låst; lås upp den?",
    confirmTitle: "Redigering är låst",
  },
};
