import { FlatDataExportOption } from "@openforis/arena-core";

export default {
  recordReadOnlyOfAnotherUserGroup:
    "Ovaj zapis pripada drugoj grupi korisnika: može samo da se pregleda. Klonirajte ga da biste ga mijenjali",
  autoSync: {
    checkbox: "Automatska sinhronizacija",
    synced: "Automatski sinhronizovano zapisa: {{count}}",
    synced_other: "Automatski sinhronizovano zapisa: {{count}}",
    synced_few: "Automatski sinhronizovano zapisa: {{count}}",
    statusLabel: "Status sinhronizacije:",
    statusTitle: "Status sinhronizacije",
    syncInProgressToast:
      "Automatska sinhronizacija je u toku. Sačekajte da se završi prije ručnog slanja podataka.",
    batteryDataWarning:
      "Može povećati potrošnju baterije i mobilnih podataka kada niste na Wi-Fi mreži",
    syncNow: "Sinhronizuj sada",
    recordSyncInProgress:
      "Ovaj zapis se sinhronizuje sa serverom. Molimo sačekajte trenutak",
    status: {
      syncedTooltip: "Svi zapisi su sinhronizovani sa serverom",
      pendingTooltip:
        "Neke zapise još treba sinhronizovati. Biće poslati automatski",
      errorTooltip:
        "Neki zapisi imaju greške sinhronizacije i zahtijevaju vašu pažnju. Otvorite 'Pošalji podatke' da biste ih riješili",
      needsManualFixTooltip:
        "Neki zapisi ne mogu se sinhronizovati dok ih ne ispravite (npr. nedostaju vrijednosti ključeva, isti ključevi kao zapis koji je već na serveru kada spajanje nije dozvoljeno ili više nisu u koraku unosa). Provjerite njihov status sinhronizacije u listi zapisa",
      mergeWithSameKeysNotAllowedNote:
        "Neki zapisi imaju iste ključeve kao zapis koji je već na serveru, a njihovo spajanje nije dozvoljeno za ovo istraživanje. Ako su to različiti zapisi, promijenite vrijednosti njihovih ključeva; ako je to isti zapis, obratite se administratoru istraživanja.",
      syncingTooltip: "Sinhronizacija zapisa...",
      progressPercent: "{{progressPercent}}%",
      uncheckedTooltip:
        "Status sinhronizacije još nije provjeren. Koristite 'Provjeri status' da ga provjerite",
      offlineTooltip:
        "Nema internet veze. Automatska sinhronizacija nastaviće se kada ponovo budete na mreži",
      authErrorTooltip:
        "Vaša sesija na serveru je istekla. Prijavite se ponovo da biste nastavili automatsku sinhronizaciju",
      checkErrorTooltip:
        "Status sinhronizacije nije moguće provjeriti zbog greške na serveru. Pokušajte ponovo",
      noCandidatesMessage: "Trenutno nema ništa za slanje",
    },
  },
  confirmUpdateNodesBecameNotApplicable: {
    title: "Čvorovi više neće biti primjenjivi",
    message: `Sljedeći čvorovi više neće biti primjenjivi:  
  
{{attributeNames}}  
  
Njihove vrijednosti biće obrisane.  
Nastaviti?`,
  },
  confirmGoToListOfRecords: `Idi na listu zapisa?

(sve izmjene su već sačuvane)`,
  checkStatus: "Provjeri status",
  closestSamplingPoint: {
    findClosestSamplingPoint: "Pronađi najbližu tačku uzorka",
    findingClosestSamplingPoint: "Traženje najbliže tačke uzorka",
    minDistanceItemFound: "Stavka pronađena na udaljenosti od {{minDistance}}m",
    minDistanceItemFound_other:
      "Stavke pronađene na udaljenosti od {{minDistance}}m",
    minDistanceItemFound_few:
      "Stavke pronađene na udaljenosti od {{minDistance}}m",
    useSelectedItem: "Koristi izabranu stavku",
  },
  confirmDeleteSelectedItems: {
    message: "Obrisati izabrane stavke?",
  },
  confirmDeleteValue: {
    message: "Obrisati ovu vrijednost?",
  },
  confirmOverwriteValue: {
    message: "Prepisati postojeću vrijednost?",
  },
  confirmUpdateDependentEnumeratedEntities: {
    message: `Ako nastavite, neki nabrojani entiteti ({{entityDefs}}) biće ponovo nabrojani, pri čemu će se obrisati postojeće vrijednosti unesene u njih (ako ih ima).  
  
Ažurirati nabrojane entitete?`,
    title: "Ažuriraj nabrojane entitete",
  },
  createRecordError: "Greška pri kreiranju novog zapisa: {{error}}",
  userGroupNotReady: {
    title: "Informacije o korisniku nisu spremne",
    message: `Informacije o vašoj korisničkoj grupi još nisu preuzete sa servera. Ovo istraživanje ima atribute koji se unaprijed popunjavaju na osnovu vaše korisničke grupe, pa bi kreiranje zapisa sada moglo da ih ostavi praznim ili netačnim.

Da li želite da ih ponovo preuzmete sa servera?`,
    fetchAgain: "Preuzmi ponovo",
    stillNotReady:
      "Nije moguće preuzeti informacije o vašoj korisničkoj grupi sa servera. Zapis nije kreiran.",
  },
  updateAttributeError: "Greška pri ažuriranju vrijednosti: {{error}}",
  cycle: "Ciklus",
  cycleForNewRecords: "Ciklus za nove zapise:",
  dataExport: {
    confirm: {
      title: "Potvrdi izvoz podataka",
      message: `Zapisi za izvoz:
{{recordsCountSummary}}`,
      selectOptions: `Izaberite opcije izvoza:`,
    },

    error: "Greška pri izvozu podataka. Detalji: {{details}}",
    exportedSuccessfullyButFilesMissing: `Podaci su uspješno izvezeni, ali {{missingFiles}} fajlova/slika nedostaje ili je oštećeno.
Provjerite svoje zapise, a provjerite i zapise na serveru`,
    exportingData: "Izvoz podataka...",
    exportToCsv: "Izvezi u CSV",
    mergeConflictingRecords: "Spoji zapise u konfliktu",
    mergeWithSameKeysNotAllowed:
      "Spajanje zapisa sa istim ključevima nije dozvoljeno za ovo istraživanje, pa zapisi sa ključevima u konfliktu neće biti poslati. Ako su to različiti zapisi, promijenite vrijednosti njihovih ključeva; ako je to isti zapis, obratite se administratoru istraživanja.",
    mergeSameRecordConflictConfirm: {
      title: "Spoji zapise uređivane na oba uređaja",
      message: `Zapisi ({{count}}) su izmijenjeni i na serveru od posljednje sinhronizacije sa ovim uređajem.

Spajanje će objediniti vaše izmjene sa izmjenama na serveru: za svako polje biće zadržana posljednja unesena vrijednost, a biće zadržani i svi novi odjeljci dodati na bilo kom uređaju.

Ovo nije moguće unaprijed pregledati. Prevucite za potvrdu i nastavite.`,
    },
    noRecordsInDeviceToExport: "Na uređaju nema zapisa za izvoz",
    onlyNewOrUpdatedRecords: "Izvezi samo nove ili ažurirane zapise",
    recordsMergedMessage: `Sljedeći zapisi su spojeni sa novijom verzijom koja je već na serveru:
{{recordsList}}

Spojena verzija tih zapisa je automatski preuzeta.`,
    onlyRecordsInRemoteServerCanBeImported:
      "Mogu se uvesti samo zapisi koji su već na udaljenom serveru ili zapisi koji su ažurirani na serveru",
    option: {
      [FlatDataExportOption.addCycle]: "Dodaj ciklus",
      [FlatDataExportOption.includeAncestorAttributes]: "Atributi predaka",
      [FlatDataExportOption.includeCategoryItemsLabels]:
        "Oznake stavki kategorija",
      [FlatDataExportOption.includeFiles]: "Atributi fajlova",
      [FlatDataExportOption.includeTaxonScientificName]: "Naučni naziv taksona",
    },
    selectTarget: "Izaberite odredište izvoza",
    selectTargetMessage: `Izaberite odredište izvoza:`,
    shareExportedFile: "Podijeli izvezeni fajl",
    target: {
      remote: "Udaljeni server",
      local: "Lokalni folder (Download)",
      share: "$t(common:shareFile)",
    },
    recordsWithMissingFilesConfirm: {
      confirmButton: "Izvezi bez fajlova koji nedostaju",
      title: "Fajlovi nedostaju",
      message: `Sljedećim zapisima nedostaju fajlovi i biće izvezeni bez njih:\n{{recordsList}}\n\nDa li ipak želite da nastavite?`,
    },
    title: "Izvoz podataka",
  },
  editNodeDef: "Uredi: {{nodeDef}}",
  viewNodeDef: "Prikaži: {{nodeDef}}",
  errorFetchingRecordsSyncStatus: `Greška pri preuzimanju zapisa sa servera.

Provjerite podešavanja veze.

Detalji: {{details}}`,
  errorGeneratingRecordsExportFile:
    "Greška pri generisanju fajla za izvoz zapisa: {{details}}",
  errorLoadingRecords: "Greška pri učitavanju zapisa: {{details}}",
  exportNewOrUpdatedRecords: "Izvezi nove ili ažurirane zapise",
  formLanguage: "Jezik obrasca:",
  node: {
    cannotAddMoreItems: {
      maxCountReached: `Nije moguće dodati još stavki: 
dostignut je maksimalan broj`,
    },
    cannotDeleteNode: {
      noNodeFound: "Nije moguće obrisati čvor: čvor nije pronađen",
    },
    cannotUpdateSingleAttributeValue: {
      noNodeFound: "Nije moguće ažurirati vrijednost: čvor nije pronađen",
    },
  },
  entityListColumns: {
    button: "Kolone",
    hideAll: "Sakrij sve",
    keys: "Ključni atributi",
    other: "Ostali atributi",
    reset: "Podrazumevano",
    showAll: "Prikaži sve",
    summary: "Atributi rezimea",
    title: "Vidljive kolone",
  },
  noEntitiesDefined: "Nije definisan nijedan entitet",
  goToDataEntry: "Idi na unos podataka",
  goToListOfRecords: "Idi na listu zapisa",
  gpsLockingEnabledWarning: "Upozorenje: GPS zaključavanje je uključeno!",
  listOfRecords: "Zapisi",
  localBackup: "Lokalna rezervna kopija",
  newRecord: "Novi zapis",
  newRecordShort: "Novi",
  noRecordsFound: "Nije pronađen nijedan zapis",
  options: "Opcije",
  recordEditor: "Uređivač zapisa",
  recordCompletion: {
    shortDescription: "Završeno {{percent}}%",
  },
  recordInPreviousCycle: {
    confirmShowValuesPreviousCycle: {
      title: "Prikaži vrijednosti iz prethodnog ciklusa",
      message: "Izaberite prethodni ciklus:",
      cycleItem: "Ciklus {{cycleLabel}}",
    },
    foundMessage: "Zapis u prethodnom ciklusu je pronađen!",
    notFoundMessage:
      "Zapis u ciklusu {{cycle}} sa ključevima {{keyValues}} nije pronađen",
    confirmFetchRecordInCycle: `Zapis u ciklusu {{cycle}} sa ključevima {{keyValues}} nije potpuno učitan.
Preuzeti ga sa servera?`,
    confirmSyncRecordsSummaryAndTryAgain: `$t(dataEntry:recordInPreviousCycle.notFoundMessage).
Preuzeti listu zapisa sa servera i pokušati ponovo?`,
    fetchError:
      "Greška pri preuzimanju zapisa u prethodnom ciklusu: {{details}}",
    multipleRecordsFound:
      "U ciklusu {{cycle}} pronađeno je više zapisa sa ključevima {{keyValues}}",
    valuePanelHeader: "Vrijednost u ciklusu {{prevCycle}}",
  },
  recordStatus: {
    new: "novi",
    updated: "ažuriran",
    conflicting: "u konfliktu",
    conflictingModifiedRemotely: "izmijenjen i na uređaju i na serveru",
    withValidationErrors: "sa greškama validacije",
  },
  sendData: "Pošalji podatke",
  showOnlyLocalRecords: "Prikaži samo lokalne zapise",
  syncedOn: "Sinhronizovano",
  syncStatusHeader: "Status",
  syncStatus: {
    conflictingKeys: "Zapis sa istim ključevima već postoji",
    keysNotSpecified: `Ključevi nisu navedeni`,
    new: "Novi (još nije otpremljen)",
    notModified: "Nije izmijenjen (nema izmjena za otpremanje)",
    modifiedLocally: "Izmijenjen lokalno",
    modifiedLocallyAndRemotely:
      "Izmijenjen i lokalno i na udaljenom serveru (konflikt)",
    modifiedRemotely: "Izmijenjen na udaljenom serveru",
    notInEntryStepAnymore:
      "Više nije u koraku unosa (u koraku čišćenja ili analize)",
  },
  processingData: {
    title: "Obrada podataka",
  },
  uploadingData: {
    title: "Otpremanje podataka",
    size: "Veličina fajla: {{size}}",
    speed: "Brzina otpremanja: {{speed}}/s",
    eta: "Procijenjeno preostalo vrijeme: {{eta}}",
  },
  validationReport: {
    title: "Izvještaj o validaciji",
    noErrorsFound: "Svaka čast, nije pronađena nijedna greška!",
  },

  viewModeLabel: "Način prikaza",
  viewMode: {
    form: "Obrazac",
    oneNode: "Jedan čvor",
  },

  code: {
    selectItem: "Izaberi stavku",
    selectItem_other: "Izaberi stavke",
    selectItem_few: "Izaberi stavke",
  },
  coordinate: {
    longPressMarkerToMove: "Dugo pritisnite marker da biste ga pomjerili",
    saveNewPosition: "Sačuvaj novi položaj",
    accuracy: "Tačnost (m)",
    altitude: "Nadmorska visina (m)",
    altitudeAccuracy: "Tačnost nadmorske visine (m)",
    angleToTargetLocation: "Ugao prema cilju",
    confirmConvertCoordinate:
      "Konvertovati koordinatu iz SRS {{srsFrom}} u SRS {{srsTo}}?",
    connectingToSource: "Povezivanje sa {{label}}...",
    convert: "Konvertuj",
    currentLocation: "Trenutna lokacija",
    distance: "Udaljenost (m)",
    externalGpsGenericLabel: "eksterni GPS uređaj",
    getLocation: "Odredi lokaciju",
    heading: "Pravac (°)",
    map: {
      attributeViewerTitle: 'Lokacija atributa "{{attributeLabel}}"',
      chooserTitle: "Prikaži na mapi",
      inApp: "Arena Mobile",
      inAppDescription: "Radi van mreže sa preuzetim mapama",
      inAppDescriptionRelocatable:
        "Radi van mreže sa preuzetim mapama.\nPoložaj se može premjestiti",
      otherApp: "Druga aplikacija…",
      otherAppDescription:
        "Izaberite između svih instaliranih aplikacija koje mogu prikazati lokaciju",
      show: "Prikaži",
      targetViewerTitle: 'Ciljna lokacija atributa "{{attributeLabel}}"',
      viewerTitle: "Lokacija",
    },
    headingOffset: "Odstupanje pravca",
    headingSource: "Izvor pravca",
    headingSourceMagnetometer: "Senzor",
    headingSourceLocation: "GPS",
    keepXAndY: "Zadrži X i Y",
    locationHeadingNotAvailable: "GPS pravac nije dostupan!",
    magnetometerNotAvailable: "Magnetometar nije dostupan!",
    navigateToTarget: "Navigiraj do cilja",
    srs: "$t(common:srs)",
    targetLocation: "Ciljna lokacija",
    useCurrentLocation: "Koristi trenutnu lokaciju",
    usingInternalFallback: "Koristi se interni GPS ({{label}} nije dostupan)",
    usingSource: "Koristi se {{label}}",
    x: "X",
    y: "Y",
    viewModeCompass: "Kompas",
    viewModeRadar: "Radar",
    locationNavigatorInfo: {
      title: "Navigator lokacije",
      description:
        "Vodi vas do ciljne koordinate pomoću GPS-a i senzora uređaja. Prikazuje ciljnu lokaciju u odnosu na vaš trenutni položaj i omogućava vam da do nje stignete na terenu.",
      viewModesTitle: "Načini prikaza",
      compassTitle: "Kompas",
      compassDesc:
        "Prikazuje rotirajuću ružu kompasa usmjerenu prema sjeveru. Strelica pokazuje prema cilju. Kada ste vrlo blizu cilja (režim blizine), strelica se zamjenjuje tačkom na krugu tačnosti koja pokazuje relativni položaj cilja.",
      radarTitle: "Radar",
      radarDesc:
        "Prikazuje radarski pogled odozgo sa vašim položajem fiksiranim u centru. Tačka cilja se kreće oko vas u realnom vremenu i prikazuje njegov stvarni pravac i udaljenost.",
      headingSourcesTitle: "Izvori pravca",
      sensorTitle: "Senzor (magnetometar)",
      sensorDesc:
        "Koristi ugrađeni magnetometar uređaja (čip kompasa). Radi i dok stojite, ali na njega mogu uticati obližnji metalni predmeti ili magnetne smetnje.",
      gpsTitle: "GPS",
      gpsDesc:
        "Određuje pravac na osnovu GPS kretanja. Tačniji je na otvorenom prostoru, ali zahtijeva da hodate i možda nije dostupan na svim uređajima.",
    },
  },
  geo: {
    drawPolygon: "Nacrtaj poligon",
    editPolygon: "Uredi poligon",
    selectPolygonInstruction: "Dodirnite poligon da biste ga izabrali",
    selectPointInstructions: `- Dodirnite tačku da biste je izabrali.  
- Dodirnite središnju tačku da biste dodali novu tačku.`,
    editPolygonInstructions:
      "Dugo pritisnite izabranu tačku i prevucite je da biste je pomjerili.",
    tapToAddPoints: `Dodirnite mapu da biste dodali tačke.  
Pritisnite '$t(common:stop)' kada završite.`,
    deleteSelectedPoint: "Obriši izabranu tačku",
    addCurrentLocationPoint: "Dodaj trenutnu lokaciju",
    addCurrentLocationPointInstructions:
      "Pritisnite '$t(dataEntry:geo.addCurrentLocationPoint)' da biste dodali trenutnu lokaciju poligonu",
  },
  positionTracking: {
    title: "Praćenje položaja",
    start: "Pokreni praćenje",
    resume: "Nastavi",
    restart: "Počni iznova",
    restartConfirm: {
      title: "Obrisati snimljenu putanju?",
      message:
        "Sve tačke do sada snimljene u ovom atributu biće obrisane i praćenje će početi iznova. Ovo se ne može poništiti.",
    },
    delete: "Obriši putanju",
    deleteConfirm: {
      title: "Obrisati snimljenu putanju?",
      message:
        "Sve tačke snimljene u ovom atributu biće obrisane i atribut će ostati prazan. Ovo se ne može poništiti.",
    },
    stop: "Zaustavi",
    showTrack: "Prikaži putanju",
    retry: "Pokušaj ponovo",
    status: {
      idle: "Praćenje nije aktivno",
      stopped: "Praćenje je zaustavljeno",
      starting: "Pokretanje praćenja…",
      tracking: "Praćenje u toku",
      paused: "Praćenje je pauzirano",
    },
    waitingForFix: "Čeka se GPS…",
    accuracy: "±{{accuracy}} m",
    pointsCount: "Tačaka: {{count}}",
    trackSummary: "{{length}} · tačaka: {{pointsCount}} · {{duration}}",
    attributeNotEditable:
      "Vrijednost ovog atributa bilježi se praćenjem položaja",
    stopConfirm:
      "Zaustaviti praćenje? Snimljena putanja je sačuvana u atributu i može se kasnije nastaviti.",
    stopCurrentConfirm:
      "Prati se drugi atribut: zaustaviti njegovo praćenje i započeti praćenje ovog atributa?",
    interrupted:
      "Praćenje položaja je prekinuto: snimljena putanja je sačuvana. Nastavite praćenje da biste nastavili.",
    error: {
      generic: "Nije moguće pokrenuti praćenje položaja",
      permissionDenied:
        "Nije moguće pratiti položaj: pristup lokaciji nije odobren",
      locationServicesOff:
        "Nije moguće pratiti položaj: usluge lokacije su isključene",
      notSaved:
        "Putanja još nije mogla biti sačuvana u atributu: biće sačuvana kasnije",
    },
  },
  taxon: {
    search: "Pretraži takson",
    taxonNotSelected: "--- Takson nije izabran ---",
  },
  fileAttribute: {
    selectAudio: "Izaberi audio",
    selectFile: "Izaberi fajl",
    selectPicture: "Izaberi sliku",
    selectVideo: "Izaberi video",
    deleteConfirmMessage: "Obrisati postojeći fajl?",
    fileMissing: "Fajl nije pronađen u lokalnoj memoriji",
    fileSelectError: "Greška pri izboru fajla: {{error}}",
  },
  fileAttributeAudio: {
    error: {
      startingRecording: "Greška pri pokretanju audio snimanja: {{error}}",
      pausingRecording: "Greška pri pauziranju audio snimanja: {{error}}",
      resumingRecording: "Greška pri nastavljanju audio snimanja: {{error}}",
      savingRecording: "Greška pri čuvanju audio snimka",
      stoppingRecording: "Greška pri zaustavljanju audio snimanja: {{error}}",
    },
  },
  fileAttributeImage: {
    imagePreview: "Pregled slike",
    pictureResizedToSize: `Slika je smanjena na {{size}}.
Maksimalna dozvoljena veličina: {{maxSizeMB}}MB.
Provjerite podešavanja ili zamolite administratora istraživanja da promijeni ovo ograničenje.`,
    resolution: "Rezolucija",
    rotate: "Rotiraj",
    cameraOpenError: "Greška pri otvaranju kamere: {{error}}",
    rotationError: "Greška pri rotiranju slike: {{error}}",
  },
  location: {
    label: "Lokacija",
    gettingCurrentLocation: "Određivanje trenutne lokacije",
    usingCurrentLocation: "Koristi se trenutna lokacija",
  },
  unlock: {
    label: "Otključaj",
    confirmMessage: "Uređivanje zapisa je zaključano; otključati ga?",
    confirmTitle: "Uređivanje je zaključano",
  },
};
