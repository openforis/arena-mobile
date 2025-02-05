export default {
  confirmGoToListOfRecords: `Siirry tietueluetteloon?
  
  (kaikki muutokset on jo tallennettu)`,
  checkStatus: "Tarkista tila",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Etsi lähin näytteenottopiste",
    findingClosestSamplingPoint: "Etsitään lähintä näytteenottopistettä",
    minDistanceItemFound: "Kohde löydetty {{minDistance}}m:n etäisyydeltä",
    minDistanceItemFound_plural:
      "Kohteet löydetty {{minDistance}}m:n etäisyydeltä",
    useSelectedItem: "Käytä valittua kohdetta",
  },
  confirmDeleteSelectedItems: {
    message: "Poistetaanko valitut kohteet?",
  },
  confirmDeleteValue: {
    message: "Poistetaanko tämä arvo?",
  },
  confirmOverwriteValue: {
    message: "Ylikirjoitetaanko olemassa oleva arvo?",
  },
  cycle: "Jakso",
  cycleForNewRecords: "Jakso uusille tietueille:",
  options: "Valinnat",
  editNodeDef: "Muokkaa {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Virhe tietueiden noudossa palvelimelta.
  
  Tarkista yhteysasetukset.
  
  Tiedot: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Virhe tietueiden vientitiedoston luomisessa: {{details}}",
  errorLoadingRecords: "Virhe tietueiden lataamisessa: {{details}}",
  exportData: {
    title: "Vie tiedot",
    confirm: {
      title: "Vahvista tietojen vienti",
      message: `Vietävät tietueet:
  - {{newRecordsCount}} uutta tietuetta;
  - {{updatedRecordsCount}} päivitettyä tietuetta
  - {{conflictingRecordsCount}} ristiriitaista tietuetta`,
    },
    noRecordsInDeviceToExport: "Laitteessa ei ole vietäviä tietueita",
    onlyNewOrUpdatedRecords: "Vie vain uudet tai päivitetyt tietueet",
    mergeConflictingRecords:
      "Yhdistä ristiriitaiset tietueet (samalla avaimella)",
    onlyRecordsInRemoteServerCanBeImported:
      "Vain palvelimella jo olevat tai etäpalvelimella päivitetyt tietueet voidaan tuoda",
  },
  exportNewOrUpdatedRecords: "Vie uudet tai päivitetyt tietueet",
  formLanguage: "Lomakkeen kieli:",
  noEntitiesDefined: "Entiteettejä ei ole määritetty",
  goToDataEntry: "Siirry tiedon syöttöön",
  goToListOfRecords: "Siirry tietueluetteloon",
  gpsLockingEnabledWarning: "Varoitus: GPS-lukitus käytössä!",
  listOfRecords: "Tietueet",
  localBackup: "Paikallinen varmuuskopio",
  newRecord: "Uusi",
  noRecordsFound: "Tietueita ei löydy",
  recordEditor: "Tietueen muokkain",
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Näytä arvot edellisestä jaksosta",
      message: "Valitse edellinen jakso:",
      cycleItem: "Jakso {{cycleLabel}}",
    },
    foundMessage: "Tietue edellisestä jaksosta löytyi!",
    notFoundMessage:
      "Tietuetta jaksossa {{cycle}} avaimilla {{keyValues}} ei löydy",
    confirmFetchRecordInCycle:
      "Tietuetta jaksossa {{cycle}} avaimilla {{keyValues}} ei ole täysin ladattu; ladataanko se palvelimelta?",
    confirmSyncRecordsSummaryAndTryAgain:
      "$t(dataEntry:recordInPreviousCycle.notFoundMessage): haetaanko tietueluettelo palvelimelta ja yritetään uudelleen?",
    fetchError: "Virhe tietueen noudossa edellisestä jaksosta: {{details}}",
    multipleRecordsFound:
      "Useita tietueita avaimilla {{keyValues}} löytyi jaksosta {{cycle}}",

    valuePanelHeader: "Arvo jaksossa {{prevCycle}}",
  },
  sendData: "Lähetä tiedot",
  showOnlyLocalRecords: "Näytä vain paikalliset tietueet",
  syncedOn: "Synkronoitu",
  syncStatusHeader: "Tila",
  syncStatus: {
    conflictingKeys: "Tietue samalla avaimella on jo olemassa",
    keysNotSpecified: `Avainta(vat) ei määritetty`,
    new: "Uusi (ei vielä ladattu)",
    notModified: "Ei muokattu (ei muutoksia ladattavaksi)",
    modifiedLocally: "Muokattu paikallisesti",
    modifiedRemotely: "Muokattu etäpalvelimella",
    notInEntryStepAnymore:
      "Ei enää syöttövaiheessa (puhdistus- tai analyysivaiheessa)",
  },

  validationReport: {
    title: "Validointiraportti",
    noErrorsFound: "Hienoa, virheitä ei löytynyt!",
  },

  viewModeLabel: "Näkymätila",
  viewMode: {
    form: "Lomake",
    oneNode: "Yksi solmu",
  },

  code: {
    selectItem: "Valitse kohde",
    selectItem_plural: "Valitse kohteet",
  },
  coordinate: {
    accuracy: "Tarkkuus (m)",
    altitude: "Korkeus (m)",
    altitudeAccuracy: "Korkeuden tarkkuus (m)",
    angleToTargetLocation: "Kulma kohteeseen",
    confirmConvertCoordinate:
      "Muunnetaanko koordinaatti SRS:stä {{srsFrom}} SRS:ään {{srsTo}}?",
    convert: "Muunna",
    currentLocation: "Nykyinen sijainti",
    distance: "Etäisyys (m)",
    getLocation: "Hae sijainti",
    heading: "Suunta (astetta)",
    keepXAndY: "Säilytä X ja Y",
    magnetometerNotAvailable: "Magnetometri ei ole käytettävissä!",
    navigateToTarget: "Navigoi kohteeseen",
    srs: "$t(common:srs)",
    useCurrentLocation: "Käytä nykyistä sijaintia",
    x: "X",
    y: "Y",
  },
  taxon: {
    search: "Hae taksonia",
    taxonNotSelected: "--- Taksonia ei ole valittu ---",
  },
  fileAttribute: {
    chooseAudio: "Valitse äänitiedosto",
    chooseFile: "Valitse tiedosto",
    choosePicture: "Valitse kuva",
    chooseVideo: "Valitse video",
    deleteConfirmMessage: "Poistetaanko olemassa oleva tiedosto?",
  },
  fileAttributeImage: {
    imagePreview: "Kuvan esikatselu",
    pictureResizedToSize: "Kuvan koko muutettu kokoon {{size}}",
    resolution: "Resoluutio",
  },
  dataExport: {
    error: "Virhe tiedon viennissä. Tiedot: {{details}}",
    selectTarget: "Valitse vientikohde",
    selectTargetMessage: `Valitse viennin kohde:`,
    target: {
      remote: "Etäpalvelin",
      local: "Paikallinen kansio (Lataukset)",
      share: "Jaa tiedosto",
    },
    shareExportedFile: "Jaa viety tiedosto",
  },
  location: {
    gettingCurrentLocation: "Haetaan nykyistä sijaintia",
    usingCurrentLocation: "Käytetään nykyistä sijaintia",
  },
  unlock: {
    label: "Avaa",
    confirmMessage: "Tietueen muokkaus on lukittu; avataanko se?",
    confirmTitle: "Muokkaus on lukittu",
  },
};
