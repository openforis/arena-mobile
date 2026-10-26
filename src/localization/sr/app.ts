export default {
  appVersionNotSupported: {
    title: "Potrebno je ažuriranje aplikacije",
    message:
      "Server više ne podržava ovu verziju aplikacije Arena Mobile.\nAžurirajte je na verziju {{minVersion}} ili noviju da biste nastavili.",
    messageWithoutMinVersion:
      "Server više ne podržava ovu verziju aplikacije Arena Mobile.\nAžurirajte je da biste nastavili.",
    update: "Ažuriraj",
  },
  backup: "Rezervna kopija",
  changelog: "Lista izmjena",
  confirmExit: {
    title: "Izlaz",
    message: `Izaći iz aplikacije?
Sve izmjene su već sačuvane.`,
  },
  currentVersion: "Trenutna verzija",
  fullBackup: {
    confirmMessage: `Napraviti potpunu rezervnu kopiju? 
Veličina će biti oko {{size}}.`,
    confirmTitle: "Napravi rezervnu kopiju",
    error: "Greška pri pravljenju potpune rezervne kopije: {{details}}",
    shareTitle: "Podijeli potpunu rezervnu kopiju AM",
    title: "Potpuna rezervna kopija",
  },
  initializationStep: {
    starting: "pokretanje",
    fetchingDeviceInfo: "Preuzimanje informacija o uređaju",
    fetchingSettings: "Preuzimanje podešavanja",
    storingSettings: "Čuvanje podešavanja",
    settingFullScreen: "Postavljanje prikaza preko cijelog ekrana",
    settingKeepScreenAwake: "postavljanje ekrana da ostane uključen",
    startingGpsLocking: "Pokretanje GPS zaključavanja",
    initializingDb: "Inicijalizacija baze podataka",
    startingDbMigrations: "Pokretanje migracija baze podataka",
    fetchingSurveys: "Preuzimanje istraživanja",
    importingDemoSurvey: "Uvoz demo istraživanja",
    updatingDemoSurvey: "Ažuriranje demo istraživanja",
    fetchingAndSettingLocalSurveys:
      "Preuzimanje i postavljanje lokalnih istraživanja",
    fetchingAndSettingSurvey: "Preuzimanje i postavljanje istraživanja",
    checkingLoggedIn: "Provjera prijave",
    complete: "Završeno",
  },
  logs: {
    title: "Logovi",
    subtitle:
      "Log fajlovi čuvaju dijagnostičke informacije koje mogu pomoći u rješavanju problema.",
    clear: {
      label: "Obriši logove",
      confirmMessage:
        "Da li ste sigurni da želite da obrišete sve log fajlove?",
    },
    exportLabel: "Izvezi logove",
  },
  pleaseWaitMessage: "Molimo sačekajte...",
  preview: {
    error: "Greška pri učitavanju pregleda istraživanja: {{error}}",
    waitingForSurvey: "Čeka se istraživanje za pregled...",
  },
  update: "Ažuriraj",
  updateAvailable: "Dostupno ažuriranje",
  updateStatus: {
    error: "Greška pri preuzimanju statusa ažuriranja aplikacije: {{error}}",
    networkNotAvailable:
      "Nije moguće provjeriti status ažuriranja aplikacije: $t(networkNotAvailable)",
    upToDate: "Aplikacija je ažurna",
  },
};
