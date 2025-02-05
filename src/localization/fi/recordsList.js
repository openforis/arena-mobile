export default {
  cloneRecords: {
    title: "Kloonaa",
    confirm: {
      message:
        "Kloonataanko valitut {{recordsCount}} tietuetta sykliin {{cycle}}?",
    },
    onlyRecordsImportedInDeviceOrModifiedLocallyCanBeCloned:
      "Vain laitteeseen tuodut tai paikallisesti muokatut tietueet voidaan kloonata seuraavaan sykliin",
    completeSuccessfully: "Tietueet kloonattu onnistuneesti sykliin {{cycle}}!",
  },
  confirmImportRecordFromServer: "Tuodaanko tietue palvelimelta?",
  dateModifiedRemotely: "Muokkauspäivä etänä",
  deleteRecordsConfirm: {
    title: "Poista tietueet",
    message: "Poistetaanko valitut tietueet?",
  },
  duplicateKey: {
    title: "Kaksoiskappaleavain",
    message: `Toinen tietue samalla avaimella ({{keyValues}}) on jo olemassa.`,
  },
  exportRecords: {
    title: "Vie",
  },
  importRecord: "Tuo tietue",
  importRecords: {
    title: "Tuo palvelimelta",
  },
  importRecordsFromFile: {
    title: "Tuo",
    confirmMessage: `Tuodaanko tietueet valitusta tiedostosta
  {{fileName}}?`,
    invalidFileType: "Virheellinen tiedostotyyppi (odotettiin .zip)",
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
  origin: { title: "Alkuperä", L: "Paikallinen", R: "Etä" },
  owner: "Omistaja",
};
