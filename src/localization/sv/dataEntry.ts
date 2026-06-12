import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmUpdateNodesBecameNotApplicable: {
    title: "Noder kommer inte längre att gälla",
    message: `Följande noder kommer inte längre att gälla:  
  
{{attributeNames}}  
  
Deras värden kommer att rensas.  
Fortsätta?`,
  },
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
  createRecordError: "Fel vid skapande av ny post: {{error}}",
  updateAttributeError: "Fel vid uppdatering av värde: {{error}}",
  cycle: "Cykel",
  cycleForNewRecords: "Cykel för nya poster:",
  options: "Alternativ",
  editNodeDef: "Redigera {{nodeDef}}",
  viewNodeDef: "Visa {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Fel vid hämtning av poster från servern.
  
  Kontrollera anslutningsinställningarna.
  
  Detaljer: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Fel vid generering av exportfil för poster: {{details}}",
  errorLoadingRecords: "Fel vid laddning av poster: {{details}}",
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
    cannotDeleteNode: {
      noNodeFound: "Kan inte ta bort noden: ingen nod hittades",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Kan inte uppdatera värdet: ingen nod hittades",
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
  recordStatus: {
    new: "ny",
    updated: "uppdaterad",
    conflicting: "konfliktfylld",
    withValidationErrors: "med valideringsfel",
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
  uploadingData: {
    title: "Laddar upp data",
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
    headingOffset: "Kursavvikelse",
    keepXAndY: "Behåll X och Y",
    magnetometerNotAvailable: "Magnetometer inte tillgänglig!",
    navigateToTarget: "Navigera till mål",
    srs: "$t(common:srs)",
    useCurrentLocation: "Använd aktuell plats",
    x: "X",
    y: "Y",
    viewModeCompass: "Kompass",
    viewModeRadar: "Radar",
    locationNavigatorInfo: {
      title: "Location Navigator",
      description:
        "Guides you toward a target coordinate using your device's GPS and sensors. It shows a target location relative to your current position and lets you navigate to it in the field.",
      viewModesTitle: "View Modes",
      compassTitle: "Compass",
      compassDesc:
        "Displays a rotating compass rose aligned to North. An arrow points toward the target. When very close to the target (proximity mode), the arrow is replaced with a dot on the accuracy circle showing the target's relative position.",
      radarTitle: "Radar",
      radarDesc:
        "Shows a top-down radar view with your position fixed at the center. The target dot moves around you in real time to reflect its actual direction and distance.",
      headingSourcesTitle: "Heading Sources",
      sensorTitle: "Sensor (Magnetometer)",
      sensorDesc:
        "Uses the device's built-in magnetometer (compass chip). Works while standing still, but can be affected by nearby metal objects or magnetic interference.",
      gpsTitle: "GPS",
      gpsDesc:
        "Derives heading from GPS movement. More accurate in open spaces, but requires you to be walking and may not be available on all devices.",
    },
  },
  geo: {
    drawPolygon: "Rita polygon",
    editPolygon: "Redigera polygon",
    selectPolygonInstruction: "Tryck på en polygon för att välja den",
    editPolygonInstructions: `Tryck på ett hörn eller mittpunkt för att välja det, sedan:
- Tryck länge för att dra ett hörn och flytta det.  
- Tryck på '$t(dataEntry:geo.deleteSelectedPoint)' för att ta bort det.`,
    tapToAddPoints: `Tryck på kartan för att lägga till punkter.  
Tryck '$t(dataEntry:geo.stopAddingPoints)' när du är klar.`,
    deleteSelectedPoint: "Ta bort vald punkt",
    addCurrentLocationPoint: "Lägg till aktuell plats",
    addCurrentLocationPointInstructions:
      "Tryck på '$t(dataEntry:geo.addCurrentLocationPoint)' för att lägga till aktuell plats i polygonen",
  },
  taxon: {
    search: "Sök taxon",
    taxonNotSelected: "--- Taxon inte valt ---",
  },
  fileAttribute: {
    selectAudio: "Välj ljud",
    selectFile: "Välj fil",
    selectPicture: "Välj bild",
    selectVideo: "Välj video",
    deleteConfirmMessage: "Ta bort befintlig fil?",
    fileSelectError: "Fel vid val av fil: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Fel vid start av ljudinspelning: {{error}}",
      pausingRecording: "Fel vid paus av ljudinspelning: {{error}}",
      resumingRecording: "Fel vid återupptagning av ljudinspelning: {{error}}",
      savingRecording: "Fel vid sparande av ljudinspelning",
      stoppingRecording: "Fel vid stopp av ljudinspelning: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Förhandsvisning av bild",
    pictureResizedToSize: `Bilden har ändrats till {{size}}.
Maximalt tillåten storlek: {{maxSizeMB}}MB.
Kontrollera inställningarna eller be undersökningsadministratören att ändra denna gräns.`,
    resolution: "Upplösning",
    rotate: "Rotera",
    cameraOpenError: "Fel vid öppning av kameran: {{error}}",
    rotationError: "Fel vid rotering av bilden: {{error}}",
  },
  dataExport: {
    confirm: {
      title: "Bekräfta dataexport",
      message: `Poster att exportera:
{{recordsCountSummary}}`,
      selectOptions: `Välj exportalternativ:`,
    },

    error: "Fel vid export av data. Detaljer: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Data exporterades framgångsrikt, men {{missingFiles}} filer/bilder saknas eller är skadade. Vänligen kontrollera dina register och även registren på servern.",
    exportingData: "Exporterar data...",
    exportToCsv: "Exportera till CSV",
    mergeConflictingRecords: "Slå samman konflikterande poster (samma nycklar)",
    noRecordsInDeviceToExport: "Inga poster i enheten att exportera",
    onlyNewOrUpdatedRecords: "Exportera endast nya eller uppdaterade poster",
    onlyRecordsInRemoteServerCanBeImported:
      "Endast poster som redan finns på fjärrservern eller poster som har uppdaterats på distans kan importeras",
    option: {
      [FlatDataExportOption.addCycle]: "Lägg till cykel",
      [FlatDataExportOption.includeAncestorAttributes]: "Förfädersattribut",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Kategoriartikeletiketter",
      [FlatDataExportOption.includeFiles]: "Filattribut",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Vetenskapligt taxonnamn",
    },
    selectTarget: "Välj exportmål",
    selectTargetMessage: `Välj exportens mål:`,
    shareExportedFile: "Dela exporterad fil",
    target: {
      remote: "Fjärrserver",
      local: "Lokal mapp (Nedladdning)",
      share: "$t(common:shareFile)",
    },
    title: "Exportera data",
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
