export default {
  cloneRecords: {
    title: "Klon",
    confirm: {
      message:
        "Klonas de valda {{recordsCount}} posterna till cykel {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Endast poster som importerats till enheten eller ändrats lokalt kan klonas till nästa cykel",
    completeSuccessfully: "Poster har klonats till cykel {{cycle}}!",
  },
  confirmImportRecordFromServer: "Importera post från servern?",
  continueEditing: {
    title: "Fortsätt redigera",
    confirm: {
      message: "Fortsätta redigera där du slutade?",
    },
  },
  dateModifiedRemotely: "Datum ändrat på distans",
  deleteRecordsConfirm: {
    title: "Ta bort poster",
    message: "Ta bort de valda posterna?",
  },
  duplicateKey: {
    title: "Duplicerad nyckel",
    message: `En annan post med samma nyckel ({{keyValues}}) finns redan.`,
  },
  exportRecords: {
    title: "Exportera",
  },
  importRecord: "Importera post",
  importRecords: {
    title: "$t(common:import)",
    error: {
      surveyNotVisibleInMobile:
        "Kan inte importera poster: denna undersökning ska inte vara synlig i Arena Mobile",
      recordsDownloadNotAllowed:
        "Att importera poster från Arena-servern är inte tillåtet",
    },
  },
  importRecordsFromFile: {
    title: "Importera",
    confirmMessage: `Importera poster från vald fil
  {{fileName}}?`,
    invalidFileType: "Ogiltig filtyp (förväntades .zip)",
    overwriteExistingRecords: "Skriv över befintliga poster",
    selectFile: "Välj fil",
  },
  importCompleteSuccessfully: `Import av poster slutförd!
  - {{processedRecords}} poster behandlade
  - {{insertedRecords}} poster infogade
  - {{updatedRecords}} poster uppdaterade`,
  importFailed: "Import av poster misslyckades: {{details}}",
  loadStatus: {
    title: "Laddad",
    C: "Komplett",
    P: "Delvis (utan filer)",
    S: "Endast sammanfattning",
  },
  origin: { title: "Ursprung", L: "Lokal", R: "Fjärr" },
  owner: "Ägare",
  sendData: {
    error: {
      generic: "Kan inte skicka data till servern: {{details}}",
      surveyNotVisibleInMobile:
        "Den aktuella undersökningen ska inte vara synlig i Arena Mobile",
      recordsUploadNotAllowed:
        "Att ladda upp poster från Arena Mobile till servern är inte tillåtet",
    },
  },
};
