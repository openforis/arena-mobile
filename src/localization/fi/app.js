export default {
  backup: "Varmuuskopiointi",
  changelog: "Muutosloki",
  confirmExit: {
    title: "Poistu",
    message: `Poistu sovelluksesta?
  Kaikki muutokset on jo tallennettu.`,
  },
  currentVersion: "Nykyinen versio",
  fullBackup: {
    confirmMessage: `Luodaanko täysi varmuuskopio?
  Koko on noin {{size}}.`,
    confirmTitle: "Luo varmuuskopio",
    error: "Virhe täyden varmuuskopion luomisessa: {{details}}",
    shareTitle: "Jaa AM:n täysi varmuuskopio",
    title: "Täysi varmuuskopio",
  },
  initializationStep: {
    starting: "käynnistyy",
    fetchingDeviceInfo: "Laitetietojen haku",
    fetchingSettings: "Asetusten haku",
    storingSettings: "Asetusten tallennus",
    settingFullScreen: "Kokoruudun asetus",
    settingKeepScreenAwake: "Näytön pitäminen hereillä",
    startingGpsLocking: "GPS-lukituksen aloitus",
    initializingDb: "Tietokannan alustaminen",
    startingDbMigrations: "Tietokannan migraatioiden aloitus",
    fetchingSurveys: "Kyselyiden haku",
    importingDemoSurvey: "Demo-kyselyn tuonti",
    fetchingAndSettingLocalSurveys: "Paikallisten kyselyiden haku ja asetus",
    fetchingAndSettingSurvey: "Kyselyn haku ja asetus",
    checkingLoggedIn: "Kirjautumisen tarkistus",
    complete: "Valmis",
  },
  pleaseWaitMessage: "Odota hetki...",
  update: "Päivitä",
  updateAvailable: "Päivitys saatavilla",
  updateStatus: {
    error: "Virhe sovelluksen päivitystilan haussa: {{error}}",
    networkNotAvailable:
      "Sovelluksen päivitystilaa ei voida tarkistaa: $t(networkNotAvailable)",
    upToDate: "Sovellus on ajan tasalla",
  },
};
