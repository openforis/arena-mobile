export default {
  cloneRecords: {
    title: "Kloonaa",
    confirm: {
      message:
        "Kloonataanko valitut {{recordsCount}} tietuetta jaksoon {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Vain laitteeseen tuodut tai paikallisesti muokatut tietueet voidaan kloonata seuraavaan sykliin",
    completeSuccessfully: "Tietueet kloonattu onnistuneesti jaksoon {{cycle}}!",
  },
  confirmFetchRecordFromServer: "Haetaanko tietue palvelimelta?",
  continueEditing: {
    title: "Jatka muokkausta",
    confirm: {
      message: "Jatketaanko muokkausta siitä, mihin jäit?",
    },
  },
  dateModifiedRemotely: "Muokkauspäivä etänä",
  deleteRecordsConfirm: {
    title: "Poista tietueet",
    message: "Poistetaanko valitut tietueet?",
  },
  duplicateKey: {
    title: "Avain on kahtena",
    message: `Toinen tietue samalla avaimella ({{keyValues}}) on jo olemassa.`,
  },
  exportRecords: {
    title: "Vie",
  },
  fetchRecord: "Hae tietue",
  fetchRecords: {
    title: "$t(common:fetch)",
    error: {
      surveyNotVisibleInMobile:
        "Tietueita ei voi hakea: tämän kyselyn ei pitäisi näkyä Arena Mobile -sovelluksessa",
      recordsDownloadNotAllowed:
        "Tietueiden haku Arena-palvelimelta ei ole sallittua",
    },
  },
  importRecordsFromFile: {
    title: "Tuo",
    confirmMessage: `Tuodaanko tietueet valitusta tiedostosta
  {{fileName}}?`,
    invalidFileType: "Virheellinen tiedostotyyppi (oletus .zip)",
    overwriteExistingRecords: "Ylikirjoita olemassa olevat tietueet",
    selectFile: "Valitse tiedosto",
  },
  importCompleteSuccessfully: `Tietueiden tuonti onnistui!
  - {{processedRecords}} tietuetta käsitelty
  - {{insertedRecords}} tietuetta lisätty
  - {{updatedRecords}} tietuetta päivitetty`,
  importFailed: "Tietueiden tuonti epäonnistui: {{details}}",
  loadStatus: {
    title: "Ladattu",
    C: "Valmis",
    P: "Osittainen (ilman tiedostoja)",
    S: "Vain yhteenveto",
  },
  origin: { title: "Alkuperäinen", L: "Paikallinen", R: "Palvelin" },
  owner: "Omistaja",
  recordType: {
    all: "Kaikki tietueet",
    local: "Laitteessa olevat tietueet",
  },
  sendData: {
    error: {
      generic: "Tietoja ei voi lähettää palvelimelle: {{details}}",
      surveyNotVisibleInMobile:
        "نظرسنجی فعلی نباید در آرنا موبایل قابل مشاهده باشد",
      recordsUploadNotAllowed:
        "Tietueiden lataaminen palvelimelle ei ole sallittua",
      recordsWithErrorsUploadNotAllowed:
        "Tietueiden, joissa on validointivirheitä, lataaminen palvelimelle ei ole sallittua",
    },
  },
};
