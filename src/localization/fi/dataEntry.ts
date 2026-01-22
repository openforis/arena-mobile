import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  confirmGoToListOfRecords: `Siirry tietueluetteloon?
  
  (kaikki muutokset on jo tallennettu)`,
  checkStatus: "Tarkista tila",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Etsi lähin otantakohde",
    findingClosestSamplingPoint: "Etsitään lähintä otantakohde",
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
  confirmUpdateDependentEnumeratedEntities: {
    message:
      "Jos jatkat, jotkin riippuvaiset luetteloidut entiteetit ({{entityDefs}}) luetteloidaan uudelleen, jolloin niihin mahdollisesti lisätyt aiemmat arvot poistetaan.\n\nHaluatko päivittää luetteloidut entiteetit?",
    title: "Päivitä luetteloidut entiteetit",
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
  exportNewOrUpdatedRecords: "Vie uudet tai päivitetyt tietueet",
  formLanguage: "Lomakkeen kieli:",
  noEntitiesDefined: "Entiteettejä ei ole määritetty",
  goToDataEntry: "Siirry tiedon syöttöön",
  goToListOfRecords: "Siirry tietueluetteloon",
  gpsLockingEnabledWarning: "Varoitus: GPS-lukitus käytössä!",
  listOfRecords: "Tietueet",
  localBackup: "Paikallinen varmuuskopio",
  newRecord: "Uusi",
  node: {
    cannotAddMoreItems: {
      maxCountReached: "Lisää kohteita ei voi: enimmäismäärä on saavutettu",
    },
  },
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
  recordStatus: {
    new: "uusi",
    updated: "päivitetty",
    conflicting: "ristiriitainen",
    withValidationErrors: "validointivirheillä",
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
    modifiedRemotely: "Muokattu palvelimella",
    notInEntryStepAnymore:
      "Ei enää syöttövaiheessa (puhdistus- tai analyysivaiheessa)",
  },
  uploadingData: {
    title: "Ladataan tietoja",
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
    search: "Hae lajia",
    taxonNotSelected: "--- Lajia ei ole valittu ---",
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
    pictureResizedToSize: `Kuva pienennetty kokoon {{size}}.
Suurin sallittu koko: {{maxSizeMB}}MB.
Tarkista asetukset tai pyydä kyselyn järjestelmänvalvojaa muuttamaan tätä rajaa.`,
    resolution: "Resoluutio",
  },
  dataExport: {
    confirm: {
      title: "Vahvista tietojen vienti",
      message: `Vietävät tietueet:
{{recordsCountSummary}}`,
      selectOptions: `Valitse vientivaihtoehdot:`,
    },

    error: "Virhe tiedon viennissä. Tiedot: {{details}}",
    exportedSuccessfullyButFilesMissing:
      "Tiedot vietiin onnistuneesti, mutta {{missingFiles}} tiedostoa/kuvaa puuttuu tai on vioittunut. Tarkista tietueesi ja myös palvelimen tietueet.",
    exportingData: "Viedään tietoja...",
    exportToCsv: "Vie CSV-muotoon",
    mergeConflictingRecords:
      "Yhdistä ristiriitaiset tietueet (samalla avaimella)",
    noRecordsInDeviceToExport: "Laitteessa ei ole vietäviä tietueita",
    onlyNewOrUpdatedRecords: "Vie vain uudet tai päivitetyt tietueet",
    onlyRecordsInRemoteServerCanBeImported:
      "Vain palvelimella jo olevat tai etänä päivitetyt tietueet voidaan tuoda",
    option: {
      [FlatDataExportOption.addCycle]: "Lisää sykli",
      [FlatDataExportOption.includeAncestorAttributes]:
        "Esivanhempien ominaisuudet",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Luokkien kohteiden tunnisteet",
      [FlatDataExportOption.includeFiles]: "Tiedosto-ominaisuudet",
      [FlatDataExportOption.includeTaxonScientificName]:
        "Taksonin tieteellinen nimi",
    },
    selectTarget: "Valitse vientikohde",
    selectTargetMessage: `Valitse viennin kohde:`,
    shareExportedFile: "Jaa viety tiedosto",
    target: {
      remote: "Palvelin",
      local: "Paikallinen kansio (Lataukset)",
      share: "$t(common:shareFile)",
    },
    title: "Vie tiedot",
  },
  location: {
    label: "Sijainti",
    gettingCurrentLocation: "Haetaan nykyistä sijaintia",
    usingCurrentLocation: "Käytetään nykyistä sijaintia",
  },
  unlock: {
    label: "Avaa",
    confirmMessage: "Tietueen muokkaus on lukittu; avataanko se?",
    confirmTitle: "Muokkaus on lukittu",
  },
};
