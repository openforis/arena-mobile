export default {
  authGroupName: {
    systemAdmin: "Sistemski administrator",
    surveyAdmin: "Administrator istraživanja",
    surveyEditor: "Urednik istraživanja",
    surveyManager: "Menadžer istraživanja",
    surveyGuest: "Gost istraživanja",
    dataEditor: "Unosilac podataka",
    dataCleanser: "Čistač podataka",
    dataAnalyst: "Analitičar podataka",
  },
  checkUpdates: "Provjeri ažuriranja",
  confirmDeleteSurvey: {
    title: "Obriši istraživanje",
    message: "Obrisati izabrano istraživanje?",
    message_few: "Obrisati izabrana istraživanja?",
    message_other: "Obrisati izabrana istraživanja?",
  },
  currentSurvey: "Trenutno istraživanje",
  description: "Opis",
  errorFetchingLocalSurvey:
    "Greška pri učitavanju istraživanja iz interne memorije",
  errorFetchingSurveys:
    "Greška pri preuzimanju istraživanja sa udaljenog servera",
  errorFetchingSurveysWithDetails:
    "$t(surveys:errorFetchingSurveys): {{details}}",
  fieldManual: "Terenski priručnik",
  importFromCloud: "Uvezi iz oblaka",
  importSurvey: "Uvezi istraživanje",
  importSurveyConfirmMessage: 'Uvesti istraživanje "{{surveyName}}"?',
  loadStatus: {
    label: "Status učitavanja",
    notInDevice: "nije na uređaju",
    updated: "ažurirano",
    upToDate: "ažurno",
  },
  loadSurveysErrorMessage:
    "Greška pri preuzimanju istraživanja sa udaljenog servera.\n\nKorisnik nije prijavljen ili je sesija istekla.\n\nPrijaviti se na server?",
  manageSurveys: "Upravljaj istraživanjima",
  noAvailableSurveysFound: "Nije pronađeno nijedno dostupno istraživanje",
  noSurveysMatchingYourSearch: "Nema istraživanja koja odgovaraju pretrazi",
  publishedOn: "Objavljeno",
  role: {
    label: "Uloga: {{role}}",
  },
  selectSurvey: "Izaberite istraživanje",
  status: {
    notInArenaServer: "Nije na Arena serveru",
    notVisibleInMobile: "Nije vidljivo u aplikaciji Arena Mobile",
  },
  statusMessage: "Status istraživanja je: {{status}}",
  surveysInTheCloud: "Istraživanja u oblaku",
  surveysInTheDevice: "Istraživanja na uređaju",
  title: "Istraživanja",
  updateStatus: {
    error: "Greška pri preuzimanju statusa ažuriranja istraživanja",
    networkNotAvailable:
      "Nije moguće provjeriti status ažuriranja istraživanja: $t(networkNotAvailable)",
    notUpToDate: "Dostupno ažuriranje istraživanja",
    upToDate: "Istraživanje je ažurno",
  },
  updateSurvey: "Ažuriraj istraživanje",
  updateSurveyWithNewVersionConfirmMessage:
    'Istraživanje "{{surveyName}}" ima novu verziju; ažurirati ga?',
  updateSurveyConfirmMessage:
    'Istraživanje "{{surveyName}}" je već na ovom uređaju; ažurirati ga?',
  userGroup: {
    fetching: "Preuzimanje korisničke grupe...",
    label: "Korisnička grupa: {{name}}",
    none: "Nije dodijeljena nijedna korisnička grupa",
  },
};
