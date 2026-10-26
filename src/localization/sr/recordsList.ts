export default {
  cloneRecords: {
    title: "Kloniraj",
    confirm: {
      message:
        "Klonirati izabrane zapise ({{recordsCount}}) u ciklus {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "U sljedeći ciklus mogu se klonirati samo zapisi uvezeni na uređaj ili lokalno izmijenjeni",
    completeSuccessfully: "Zapisi su uspješno klonirani u ciklus {{cycle}}!",
  },
  confirmFetchRecordFromServer: "Preuzeti zapis sa servera?",
  continueEditing: {
    title: "Nastavi uređivanje",
    confirm: {
      message: "Nastaviti uređivanje tamo gdje ste stali?",
    },
  },
  dateModifiedRemotely: "Datum izmjene na serveru",
  deleteRecordsConfirm: {
    title: "Obriši zapise",
    message: "Obrisati izabrane zapise?",
  },
  duplicateKey: {
    title: "Duplikat ključa",
    message: `Već postoji drugi zapis sa istim ključem ({{keyValues}}).`,
  },
  exportRecords: {
    title: "Izvezi",
  },
  fetchRecord: "Preuzmi zapis",
  fetchRecords: {
    title: "$t(common:fetch)",
    error: {
      surveyNotVisibleInMobile:
        "Nije moguće preuzeti zapise: ovo istraživanje ne bi trebalo da bude vidljivo u aplikaciji Arena Mobile",
      recordsDownloadNotAllowed:
        "Preuzimanje zapisa sa Arena servera nije dozvoljeno",
    },
  },
  importRecordsFromFile: {
    title: "Uvezi",
    confirmMessage: `Uvesti zapise iz izabranog fajla
{{fileName}}?`,
    invalidFileType: "Neispravan tip fajla (očekuje se .zip)",
    overwriteExistingRecords: "Prepiši postojeće zapise",
    selectFile: "Izaberi fajl",
  },
  importCompleteSuccessfully: `Uvoz zapisa je uspješno završen!
- obrađeno zapisa: {{processedRecords}}
- dodato zapisa: {{insertedRecords}}
- ažurirano zapisa: {{updatedRecords}}`,
  importFailed: "Uvoz zapisa nije uspio: {{details}}",
  loadStatus: {
    title: "Učitano",
    C: "Potpuno",
    P: "Djelimično (bez fajlova)",
    S: "Samo sažetak",
  },
  origin: { title: "Porijeklo", L: "Lokalno", R: "Udaljeno" },
  owner: "Vlasnik",
  recordHasErrorsOrWarningsTooltip: "{{itemsTypeText}} u zapisu: {{count}}",
  recordType: {
    all: "Svi zapisi",
    local: "Zapisi na uređaju",
  },
  revalidateRecords: {
    title: "Ponovo validiraj",
    allRecordsTitle: "Ponovo validiraj sve zapise",
    confirm: {
      message: `Ponovo izračunati validaciju za izabrane zapise ({{recordsCount}})?  
Koristite ovo ako zapis prikazuje greške ili upozorenja koja ne možete pronaći prilikom uređivanja.`,
    },
    completeSuccessfully: "Zapisi su uspješno ponovo validirani!",
  },
  sendData: {
    error: {
      generic: "Nije moguće poslati podatke na server: {{details}}",
      surveyNotVisibleInMobile:
        "trenutno istraživanje ne bi trebalo da bude vidljivo u aplikaciji Arena Mobile",
      recordsUploadNotAllowed: "otpremanje zapisa na server nije dozvoljeno",
      recordsWithErrorsUploadNotAllowed: `otpremanje zapisa sa greškama validacije na server nije dozvoljeno`,
    },
  },
};
