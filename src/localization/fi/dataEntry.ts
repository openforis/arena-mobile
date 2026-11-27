import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Tämä tietue kuuluu toiseen käyttäjäryhmään: sitä voi vain katsella. Kloonaa se muokataksesi sitä",
  autoSync: {
    checkbox: "Automaattinen synkronointi",
    synced: "{{count}} tietue synkronoitu automaattisesti",
    synced_other: "{{count}} tietuetta synkronoitu automaattisesti",
    statusLabel: "Synkronoinnin tila:",
    statusTitle: "Synkronoinnin tila",
    syncInProgressToast:
      "Automaattinen synkronointi on käynnissä. Odota, että se valmistuu, ennen kuin lähetät tietoja manuaalisesti.",
    batteryDataWarning:
      "Voi lisätä akun- ja datankulutusta, kun ei olla Wi-Fi-yhteydessä",
    syncNow: "Synkronoi nyt",
    recordSyncInProgress:
      "Tätä tietuetta synkronoidaan palvelimen kanssa. Odota hetki",
    status: {
      syncedTooltip: "Kaikki tietueet on synkronoitu palvelimen kanssa",
      pendingTooltip:
        "Joitakin tietueita ei ole vielä synkronoitu. Ne lähetetään automaattisesti",
      errorTooltip:
        "Joissakin tietueissa on synkronointivirheitä, jotka vaativat huomiotasi. Avaa 'Lähetä tiedot' ratkaistaksesi ne",
      needsManualFixTooltip:
        "Joitakin tietueita ei voi synkronoida ennen kuin korjaat ne (esim. puuttuvat avainarvot, samat avaimet kuin palvelimella jo olevalla tietueella, kun yhdistäminen ei ole sallittua, tai ei enää syöttövaiheessa). Tarkista niiden synkronointitila tietueluettelosta",
      mergeWithSameKeysNotAllowedNote:
        "Joillakin tietueilla on samat avaimet kuin palvelimella jo olevalla tietueella, eikä niiden yhdistäminen ole sallittua tässä kyselyssä. Jos ne ovat eri tietueita, muuta niiden avainarvoja; jos ne ovat sama tietue, ota yhteyttä kyselyn ylläpitäjään.",
      syncingTooltip: "Synkronoidaan tietueita...",
      progressPercent: "{{progressPercent}} %",
      uncheckedTooltip:
        "Synkronoinnin tilaa ei ole vielä tarkistettu. Tarkista se kohdasta 'Tarkista tila'",
      offlineTooltip:
        "Ei internetyhteyttä. Automaattinen synkronointi jatkuu, kun yhteys palautuu",
      authErrorTooltip:
        "Istuntosi palvelimen kanssa on vanhentunut. Kirjaudu uudelleen sisään jatkaaksesi automaattista synkronointia",
      checkErrorTooltip:
        "Synkronoinnin tilaa ei voitu tarkistaa palvelinvirheen vuoksi. Yritä uudelleen",
      noCandidatesMessage: "Ei juuri nyt mitään lähetettävää",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Solmut eivät enää koske",
    message: `Seuraavat solmut eivät enää koske:  
  
{{attributeNames}}  
  
Niiden arvot tyhjennetään.  
Jatketaanko?`,
  },
  confirmGoToListOfRecords: `Siirry tietueluetteloon?
  
  (kaikki muutokset on jo tallennettu)`,
  checkStatus: "Tarkista tila",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Etsi lähin otantakohde",
    findingClosestSamplingPoint: "Etsitään lähintä otantakohde",
    minDistanceItemFound: "Kohde löydetty {{minDistance}}m:n etäisyydeltä",
    minDistanceItemFound_other:
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
  createRecordError: "Virhe uutta tietuetta luotaessa: {{error}}",
  userGroupNotReady: {
    title: "Käyttäjätiedot eivät ole valmiina",
    message: `Käyttäjäryhmäsi tietoja ei ole vielä haettu palvelimelta. Tässä kyselyssä on attribuutteja, jotka täytetään automaattisesti käyttäjäryhmäsi perusteella, joten tietueen luominen nyt saattaa jättää ne tyhjiksi tai virheellisiksi.

Haluatko hakea sen uudelleen palvelimelta?`,
    fetchAgain: "Hae uudelleen",
    stillNotReady:
      "Käyttäjäryhmätietojasi ei voitu hakea palvelimelta. Tietuetta ei luotu.",
  },
  updateAttributeError: "Virhe arvoa päivitettäessä: {{error}}",
  cycle: "Jakso",
  cycleForNewRecords: "Jakso uusille tietueille:",
  options: "Valinnat",
  editNodeDef: "Muokkaa {{nodeDef}}",
  viewNodeDef: "Näytä {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Virhe tietueiden noudossa palvelimelta.
  
  Tarkista yhteysasetukset.
  
  Tiedot: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Virhe tietueiden vientitiedoston luomisessa: {{details}}",
  errorLoadingRecords: "Virhe tietueiden lataamisessa: {{details}}",
  exportNewOrUpdatedRecords: "Vie uudet tai päivitetyt tietueet",
  formLanguage: "Lomakkeen kieli:",
  entityListColumns: {
    button: "Sarakkeet",
    hideAll: "Piilota kaikki",
    keys: "Avainattribuutit",
    other: "Muut attribuutit",
    reset: "Oletus",
    showAll: "Näytä kaikki",
    summary: "Yhteenvetoattribuutit",
    title: "Näkyvät sarakkeet",
  },
  noEntitiesDefined: "Entiteettejä ei ole määritetty",
  goToDataEntry: "Siirry tiedon syöttöön",
  goToListOfRecords: "Siirry tietueluetteloon",
  gpsLockingEnabledWarning: "Varoitus: GPS-lukitus käytössä!",
  listOfRecords: "Tietueet",
  localBackup: "Paikallinen varmuuskopio",
  newRecord: "Uusi tietue",
  newRecordShort: "Uusi",
  node: {
    cannotAddMoreItems: {
      maxCountReached: "Lisää kohteita ei voi: enimmäismäärä on saavutettu",
    },
    cannotDeleteNode: {
      noNodeFound: "Solmua ei voi poistaa: solmua ei löytynyt",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Arvoa ei voi päivittää: solmua ei löytynyt",
    },
  },
  noRecordsFound: "Tietueita ei löydy",
  recordEditor: "Tietueen muokkain",
  recordCompletion: {
    shortDescription: "{{percent}} % valmis",
  },
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
    conflictingModifiedRemotely: "muokattu sekä laitteella että palvelimella",
    withValidationErrors: "validointivirheillä",
  },
  sendData: "Lähetä tiedot",
  showOnlyLocalRecords: "Näytä vain paikalliset tietueet",
  syncedOn: "Synkronoitu",
  syncStatusHeader: "Tila",
  syncStatus: {
    conflictingKeys: "Tietue samalla avaimella on jo olemassa",
    deviceDateBehindServer:
      "Ei lähetetty: laitteen päivämäärä on palvelimen päivämäärää jäljessä (aseta oikea päivämäärä ja kellonaika ja muokkaa sitten tietuetta uudelleen)",
    keysNotSpecified: `Avainta(vat) ei määritetty`,
    new: "Uusi (ei vielä ladattu)",
    notModified: "Ei muokattu (ei muutoksia ladattavaksi)",
    modifiedLocally: "Muokattu paikallisesti",
    modifiedLocallyAndRemotely:
      "Muokattu sekä paikallisesti että palvelimella (ristiriita)",
    modifiedRemotely: "Muokattu palvelimella",
    notInEntryStepAnymore:
      "Ei enää syöttövaiheessa (puhdistus- tai analyysivaiheessa)",
  },
  processingData: {
    title: "Käsitellään tietoja",
  },
  uploadingData: {
    title: "Ladataan tietoja",
    size: "Tiedoston koko: {{size}}",
    speed: "Lähetysnopeus: {{speed}}/s",
    eta: "Arvioitu jäljellä oleva aika: {{eta}}",
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
    selectItem_other: "Valitse kohteet",
  },
  coordinate: {
    longPressMarkerToMove: "Siirrä merkkiä painamalla sitä pitkään",
    saveNewPosition: "Tallenna uusi sijainti",
    accuracy: "Tarkkuus (m)",
    altitude: "Korkeus (m)",
    altitudeAccuracy: "Korkeuden tarkkuus (m)",
    angleToTargetLocation: "Kulma kohteeseen",
    confirmConvertCoordinate:
      "Muunnetaanko koordinaatti SRS:stä {{srsFrom}} SRS:ään {{srsTo}}?",
    connectingToSource: "Yhdistetään lähteeseen {{label}}...",
    convert: "Muunna",
    currentLocation: "Nykyinen sijainti",
    distance: "Etäisyys (m)",
    externalGpsGenericLabel: "ulkoinen GPS-laite",
    getLocation: "Hae sijainti",
    heading: "Suunta (astetta)",
    map: {
      attributeViewerTitle: 'Kohteen "{{attributeLabel}}" sijainti',
      chooserTitle: "Näytä kartalla",
      inApp: "Arena Mobile",
      inAppDescription:
        "Toimii ilman verkkoyhteyttä ladattujen karttojen kanssa",
      inAppDescriptionRelocatable:
        "Toimii ilman verkkoyhteyttä ladattujen karttojen kanssa.\nSijaintia voi siirtää",
      otherApp: "Muu sovellus…",
      otherAppDescription:
        "Valitse kaikista asennetuista sovelluksista, jotka voivat näyttää sijainnin",
      show: "Näytä",
      targetViewerTitle: 'Kohteen "{{attributeLabel}}" kohdesijainti',
      viewerTitle: "Sijainti",
    },
    headingOffset: "Suuntapoikkeama",
    headingSource: "Suunnan lähde",
    headingSourceMagnetometer: "Anturi",
    headingSourceLocation: "GPS",
    keepXAndY: "Säilytä X ja Y",
    locationCannotBeConvertedToSrs:
      "GPS-sijaintia ei voi muuntaa koordinaattijärjestelmään {{srs}}",
    locationHeadingNotAvailable: "GPS-suunta ei ole saatavilla!",
    magnetometerNotAvailable: "Magnetometri ei ole käytettävissä!",
    navigateToTarget: "Navigoi kohteeseen",
    srs: "$t(common:srs)",
    targetLocation: "Kohdesijainti",
    useCurrentLocation: "Käytä nykyistä sijaintia",
    usingInternalFallback:
      "Käytetään sisäistä GPS:ää ({{label}} ei saatavilla)",
    usingSource: "Käytetään lähdettä {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Kompassi",
    viewModeRadar: "Tutka",
    locationNavigatorInfo: {
      title: "Sijaintinavigaattori",
      description:
        "Opastaa sinut kohdekoordinaattiin laitteen GPS:n ja anturien avulla. Se näyttää kohteen sijainnin suhteessa nykyiseen sijaintiisi ja auttaa navigoimaan sinne maastossa.",
      viewModesTitle: "Näkymätilat",
      compassTitle: "Kompassi",
      compassDesc:
        "Näyttää pohjoiseen suunnatun, pyörivän kompassiruusun. Nuoli osoittaa kohdetta kohti. Kun kohde on hyvin lähellä (lähestymistila), nuoli korvataan tarkkuusympyrällä näkyvällä pisteellä, joka osoittaa kohteen suhteellisen sijainnin.",
      radarTitle: "Tutka",
      radarDesc:
        "Näyttää ylhäältä kuvatun tutkanäkymän, jonka keskellä sijaintisi pysyy paikallaan. Kohdepiste liikkuu ympärilläsi reaaliajassa ja kuvaa sen todellista suuntaa ja etäisyyttä.",
      headingSourcesTitle: "Suunnan lähteet",
      sensorTitle: "Anturi (magnetometri)",
      sensorDesc:
        "Käyttää laitteen sisäänrakennettua magnetometriä (kompassisirua). Toimii myös paikallaan seistessä, mutta lähellä olevat metalliesineet tai magneettiset häiriöt voivat vaikuttaa siihen.",
      gpsTitle: "GPS",
      gpsDesc:
        "Määrittää suunnan GPS-liikkeen perusteella. Tarkempi avoimilla alueilla, mutta edellyttää, että kävelet, eikä välttämättä ole käytettävissä kaikissa laitteissa.",
    },
  },
  geo: {
    drawPolygon: "Piirrä monikulmio",
    editPolygon: "Muokkaa monikulmiota",
    selectPolygonInstruction: "Paina monikulmiota sen valitsemiseksi",
    selectPointInstructions: `- Napauta pistettä valitaksesi sen.  
- Napauta keskipistettä lisätäksesi uuden pisteen.`,
    editPolygonInstructions:
      "Paina valittua pistettä pitkään ja vedä sitä siirtääksesi sen.",
    tapToAddPoints: `Napauta karttaa lisätäksesi pisteitä.  
Paina '$t(common:stop)', kun olet valmis.`,
    deleteSelectedPoint: "Poista valittu piste",
    addCurrentLocationPoint: "Lisää nykyinen sijainti",
    addCurrentLocationPointInstructions:
      "Lisää nykyinen sijainti monikulmioon painamalla '$t(dataEntry:geo.addCurrentLocationPoint)'",
  },
  positionTracking: {
    title: "Sijainnin seuranta",
    start: "Aloita seuranta",
    resume: "Jatka",
    restart: "Aloita alusta",
    restartConfirm: {
      title: "Poistetaanko tallennettu reitti?",
      message:
        "Kaikki tähän attribuuttiin tähän mennessä tallennetut pisteet poistetaan ja seuranta aloitetaan alusta. Tätä ei voi kumota.",
    },
    delete: "Poista reitti",
    deleteConfirm: {
      title: "Poistetaanko tallennettu reitti?",
      message:
        "Kaikki tähän attribuuttiin tallennetut pisteet poistetaan ja attribuutti jätetään tyhjäksi. Tätä ei voi kumota.",
    },
    stop: "Pysäytä",
    showTrack: "Näytä reitti",
    retry: "Yritä uudelleen",
    status: {
      idle: "Ei seurantaa",
      stopped: "Seuranta pysäytetty",
      starting: "Seurantaa käynnistetään…",
      tracking: "Seuranta käynnissä",
      paused: "Seuranta keskeytetty",
    },
    waitingForFix: "Odotetaan GPS:ää…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "{{count}} pistettä",
    trackSummary: "{{length}} · {{pointsCount}} pistettä · {{duration}}",
    attributeNotEditable:
      "Tämän attribuutin arvo tallennetaan sijainnin seurannalla",
    stopConfirm:
      "Pysäytetäänkö seuranta? Tallennettu reitti säilytetään attribuutissa, ja seurantaa voi jatkaa myöhemmin.",
    stopCurrentConfirm:
      "Toista attribuuttia seurataan parhaillaan: pysäytetäänkö sen seuranta ja aloitetaan tämän seuranta?",
    interrupted:
      "Sijainnin seuranta keskeytyi: tallennettu reitti on tallennettu. Jatka seurantaa jatkaaksesi.",
    error: {
      generic: "Sijainnin seurantaa ei voi aloittaa",
      permissionDenied:
        "Sijaintia ei voi seurata: sijainnin käyttöoikeutta ei ole myönnetty",
      locationServicesOff:
        "Sijaintia ei voi seurata: sijaintipalvelu on pois käytöstä",
      notSaved:
        "Reittiä ei vielä voitu tallentaa attribuuttiin: se tallennetaan myöhemmin",
    },
  },
  taxon: {
    search: "Hae lajia",
    taxonNotSelected: "--- Lajia ei ole valittu ---",
  },
  fileAttribute: {
    selectAudio: "Valitse ääni",
    selectFile: "Valitse tiedosto",
    selectPicture: "Valitse kuva",
    selectVideo: "Valitse video",
    deleteConfirmMessage: "Poistetaanko olemassa oleva tiedosto?",
    fileMissing: "Tiedostoa ei löydy paikallisesta tallennustilasta",
    fileSelectError: "Virhe tiedoston valinnassa: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Virhe äänen tallennuksen käynnistyksessä: {{error}}",
      pausingRecording: "Virhe äänen tallennuksen keskeytyksessä: {{error}}",
      resumingRecording: "Virhe äänen tallennuksen jatkamisessa: {{error}}",
      savingRecording: "Virhe äänen tallennuksen tallentamisessa",
      stoppingRecording: "Virhe äänen tallennuksen pysäytyksessä: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Kuvan esikatselu",
    pictureResizedToSize: `Kuva pienennetty kokoon {{size}}.
Suurin sallittu koko: {{maxSizeMB}}MB.
Tarkista asetukset tai pyydä kyselyn järjestelmänvalvojaa muuttamaan tätä rajaa.`,
    resolution: "Resoluutio",
    rotate: "Käännä",
    cameraOpenError: "Virhe kameran avaamisessa: {{error}}",
    rotationError: "Virhe kuvan kääntämisessä: {{error}}",
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
    uploadBatch: "Osa {{batch}}/{{batchCount}}",
    exportToCsv: "Vie CSV-muotoon",
    mergeConflictingRecords: "Yhdistä ristiriitaiset tietueet",
    mergeWithSameKeysNotAllowed:
      "Samojen avainten tietueiden yhdistäminen ei ole sallittua tässä kyselyssä, joten tietueita, joiden avaimet ovat ristiriidassa, ei lähetetä. Jos ne ovat eri tietueita, muuta niiden avainarvoja; jos ne ovat sama tietue, ota yhteyttä kyselyn ylläpitäjään.",
    mergeSameRecordConflictConfirm: {
      title: "Yhdistä molemmilla laitteilla muokatut tietueet",
      message: `{{count}} tietuetta on muokattu myös palvelimella sen jälkeen, kun tämä laite viimeksi synkronoi ne.

Yhdistäminen yhdistää muutoksesi palvelimen muutoksiin: jokaisen kentän kohdalla säilytetään viimeksi muokattu arvo, ja kummallakin laitteella lisätyt uudet osiot säilytetään.

Tätä ei voi esikatsella etukäteen. Pyyhkäise vahvistaaksesi ja jatkaaksesi.`,
    },
    noRecordsInDeviceToExport: "Laitteessa ei ole vietäviä tietueita",
    onlyNewOrUpdatedRecords: "Vie vain uudet tai päivitetyt tietueet",
    recordsMergedMessage: `Seuraavat tietueet on yhdistetty palvelimella jo olevaan uudempaan versioon:
{{recordsList}}

Näiden tietueiden yhdistetty versio on noudettu automaattisesti.`,
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
    recordsWithMissingFilesConfirm: {
      confirmButton: "Vie ilman puuttuvia tiedostoja",
      title: "Puuttuvat tiedostot",
      message: `Seuraavilla tietueilla on puuttuvia tiedostoja ja ne viedään ilman niitä:\n{{recordsList}}\n\nHaluatko jatkaa?`,
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
