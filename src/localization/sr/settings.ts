export default {
  title: "Podešavanja",
  group: {
    appearance: "Izgled",
    dataEntry: "Unos podataka",
    location: "Lokacija i GPS",
    maps: "Mape",
    images: "Slike",
  },
  animationsEnabled: {
    label: "Animacije uključene",
    description:
      "Uključuje animacije prelaza i interfejsa u cijeloj aplikaciji. Isključite ih da biste poboljšali performanse na sporijim uređajima",
  },
  autoSyncEnabled: {
    label: "Automatska sinhronizacija",
    description: "$t(dataEntry:autoSync.batteryDataWarning)",
  },
  autoSyncOpenRecordIntervalMinutes: {
    label: "Interval automatske sinhronizacije tokom uređivanja: {{value}} min",
    description:
      "Koliko dugo zapis koji je trenutno otvoren u uređivaču mora ostati nepromijenjen prije nego što ga automatska sinhronizacija otpremi",
  },
  autoSyncSlowCheckIntervalMinutes: {
    label: "Interval automatske sinhronizacije (spora provjera): {{value}} min",
    description:
      "Kada su svi zapisi već sinhronizovani, koliko često automatska sinhronizacija ponovo provjerava izmjene na serveru (npr. sa drugog uređaja). Provjere su češće kad god postoji nešto novo za otpremanje",
  },
  dataUploadChunkSizeKB: {
    label: "Veličina dijela za otpremanje podataka",
    description:
      "Veličina svakog dijela na koji se zapis dijeli prilikom otpremanja na server. Manje vrijednosti su pouzdanije na sporim ili nestabilnim vezama, ali zahtijevaju više zahtjeva za slanje iste količine podataka",
  },
  connectionToServer: "Veza sa serverom",
  fontScale: {
    label: "Veličina fonta: {{value}}",
    description: "Podešava veličinu teksta u cijeloj aplikaciji",
  },
  keepScreenAwake: {
    label: "Ekran uvijek uključen",
    description:
      "Sprječava automatsko isključivanje ekrana dok je aplikacija otvorena",
  },
  fullScreen: {
    label: "Cijeli ekran",
    description:
      "Sakriva sistemsku statusnu i navigacionu traku kako bi se cijeli ekran koristio za unos podataka",
  },
  imageSizeLimit: {
    label: "Veličina slika ograničena na: {{value}}MB",
    description:
      "Maksimalna veličina na koju se slike smanjuju prije čuvanja, osim ako istraživanje ne definiše manje ograničenje za određeni atribut",
  },
  imageSizeUnlimited: {
    label: "Veličina slika nije ograničena",
    description:
      "Slike će se čuvati u najvećoj rezoluciji koju uređaj omogućava, osim ako ograničenje nije postavljeno u dizajneru obrasca istraživanja",
  },
  language: {
    label: "Jezik aplikacije",
    description: "Postavlja jezik koji se koristi u interfejsu aplikacije",
  },
  locationAccuracyThreshold: {
    label: "Prag tačnosti lokacije (metri)",
    description:
      "Minimalna GPS tačnost, u metrima, potrebna da bi očitavanje lokacije bilo prihvaćeno za atribut koordinate",
  },
  locationAccuracyWatchTimeout: {
    label: "Vrijeme čekanja na tačnost lokacije: {{value}} sekundi",
    description:
      "Maksimalno vrijeme čekanja na očitavanje lokacije koje zadovoljava prag tačnosti prije odustajanja",
  },
  locationAveragingEnabled: {
    label: "Usrednjavanje lokacije uključeno",
    description:
      "Kada je uključeno, zabilježena lokacija biće prosjek više očitavanja lokacije, što poboljšava tačnost",
  },
  locationGpsLocked: {
    label: "GPS zaključan",
    description: `Upozorenje: potrošnja baterije će se povećati!
GPS signal će biti zaključan dok aplikacija radi.
To pomaže da se postigne bolja tačnost atributa koordinata.`,
    error:
      "Nije moguće pokrenuti GPS zaključavanje: dobavljač lokacije nije dostupan ili pristup lokaciji nije odobren",
  },
  positionTrackingAccuracyThreshold: {
    label: "Prag tačnosti praćenja položaja: {{value}} m",
    description:
      "Lokacije manje tačne od ove ne dodaju se putanji koja se snima",
  },
  positionTrackingBatterySaver: {
    label: "Ušteda baterije pri praćenju položaja",
    description:
      "Kada je uključeno, putanja će biti manje precizna, ali će potrošnja baterije biti manja",
  },
  positionTrackingMinDistance: {
    label: "Minimalna udaljenost pri praćenju položaja: {{value}} m",
    description:
      "Minimalna udaljenost između dvije tačke putanje koja se snima (veća ako je lokacija manje tačna)",
  },
  gpsDevicePairing: {
    title: "Upari GPS uređaj",
    scanButton: "Potraži uređaje",
    scanningLabel: "Traženje obližnjih uređaja…",
    scanAgainButton: "Potraži ponovo",
    emptyResult:
      "Nije pronađen nijedan uređaj. Provjerite da li je GPS prijemnik uključen i u režimu uparivanja.",
    scanFailed: "Nešto nije u redu tokom traženja. Molimo pokušajte ponovo.",
    recognizedDevicesNotice:
      "Prikazani su samo uređaji prepoznati kao GPS prijemnici.",
    pairedDevicesTitle: "Upareni uređaji",
    newDevicesTitle: "Novi uređaji",
    pairButton: "Upari",
    pairing: "Uparivanje…",
    pairingSucceeded: "Upareno sa uređajem {{name}}",
    pairingFailed: "Nije moguće upariti sa uređajem {{name}}",
    bluetoothDisabled: "Bluetooth je isključen.",
    enableBluetoothButton: "Uključi Bluetooth",
    permissionDenied: "Za traženje uređaja potrebna je dozvola za Bluetooth.",
    openSettingsButton: "Otvori podešavanja aplikacije",
  },
  preferredGpsSourceId: {
    label: "Izvor GPS-a",
    description:
      "Izaberite koji GPS se koristi za bilježenje koordinata: interni GPS telefona ili upareni eksterni GPS prijemnik (npr. Bad Elf).",
    auto: "Automatski (eksterni ako je dostupan)",
    internal: "Interni GPS",
    pairNewDevice: "Upari novi uređaj…",
  },

  mapLayer: {
    label: "Podrazumijevani sloj mape",
    description:
      "Sloj koji se prikazuje kada se otvori mapa (i dalje se može promijeniti na mapi pomoću dugmeta za slojeve)",
  },
  mapProvider: {
    label: "Dobavljač mape",
    description:
      "Mapa koja se koristi pri crtanju ili pregledu geografskih atributa. Besplatni slojevi mape mogu se unaprijed preuzeti za korišćenje van mreže (pogledajte Mape van mreže)",
    options: {
      default: "Google Maps (Apple Maps na iOS-u)",
      freeLayers:
        "Besplatni slojevi mape (satelitski, topografski) - rade van mreže",
    },
  },
  showRecordCompletion: {
    label: "Prikaži napredak popunjenosti zapisa",
    description:
      "Prikazuje traku napretka sa procentom ispunjenih zahtjeva trenutnog zapisa",
  },
  showStatusBar: {
    label: "Prikaži statusnu traku",
    description:
      "Prikazuje status baterije, memorije i mreže tokom uređivanja zapisa",
  },
  theme: {
    label: "Tema",
    description: "Postavlja temu boja koja se koristi u interfejsu aplikacije",
    auto: "Automatski",
    dark: "Tamna",
    dark2: "Tamna 2",
    light: "Svijetla",
    light2: "Svijetla 2",
  },
};
