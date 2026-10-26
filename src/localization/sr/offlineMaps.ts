export default {
  title: "Mape van mreže",
  tabs: {
    areas: "Preuzete oblasti",
    pdfMaps: "PDF mape",
  },
  description:
    "Preuzmite mapu oblasti od interesa prije odlaska na teren: biće dostupna i bez internet veze pri crtanju ili pregledu geografskih atributa.",
  freeLayersNotInUse:
    "Mape van mreže koriste se samo kada je dobavljač mape u podešavanjima postavljen na 'Besplatni slojevi mape'.",
  useFreeLayers: "Koristi besplatne slojeve mape",
  offlineMode: "Van mreže",
  addArea: "Dodaj oblast",
  deleteAll: "Obriši sve",
  deleteAllConfirm:
    "Obrisati sve oblasti mapa van mreže i sve pločice mape sačuvane na ovom uređaju?",
  clearCache: "Obriši keš mape",
  clearCacheConfirm:
    "Obrisati sve pločice mape sačuvane na ovom uređaju (pločice keširane tokom pregledanja mapa)?",
  noAreas: "Još nije preuzeta nijedna oblast mape van mreže",
  storage: {
    used: "Prostor koji zauzimaju pločice mape (preuzete oblasti i keš):",
    free: "Slobodan prostor na uređaju:",
  },
  layers: {
    esriWorldImagery: "Satelitski (Esri World Imagery)",
    openTopoMap: "Topografski (OpenTopoMap)",
    openStreetMap: "Standardni (OpenStreetMap, samo na mreži)",
  },
  customLayers: {
    title: "Prilagođeni slojevi mape",
    description:
      "Dodajte slojeve mape drugih dobavljača pločica (XYZ rasterske pločice), sa API ključem ako ga dobavljač zahtijeva. Mogu se izabrati kao podrazumijevani sloj mape u podešavanjima i pomoću dugmeta za slojeve na mapi. Provjerite da li uslovi korišćenja dobavljača to dozvoljavaju.",
    add: "Dodaj sloj",
    noLayers: "Još nije definisan nijedan prilagođeni sloj mape",
    maxZoom: "Maksimalno zumiranje: {{value}}",
    deleteConfirm:
      "Obrisati prilagođeni sloj mape '{{name}}' i njegove pločice mape sačuvane na ovom uređaju?",
    deleteConfirmWithOfflineAreas:
      "Obrisati prilagođeni sloj mape '{{name}}', njegove pločice mape sačuvane na ovom uređaju i oblasti mapa van mreže preuzete pomoću njega ({{count}})?",
    editor: {
      title: "Prilagođeni sloj mape",
      name: "Naziv",
      url: "URL šablon",
      urlHint:
        "Primjer: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} i {z} su obavezni; {apiKey} se zamjenjuje API ključem.",
      apiKey: "API ključ (opciono)",
      apiKeyHint:
        "Čuva se u bezbjednom skladištu uređaja i koristi se samo u zahtjevima prema dobavljaču pločica.",
      attribution: "Atribucija (opciono)",
      attributionHint:
        "Napomena o autorskim pravima koju zahtijeva dobavljač; prikazuje se na mapi.",
      urlChangeConfirm:
        "URL šablon je promijenjen: pločice mape ovog sloja sačuvane na ovom uređaju biće obrisane, a njegove oblasti mapa van mreže ({{count}}) moraće ponovo da se preuzmu. Nastaviti?",
      test: {
        label: "Testiraj",
        success: "Pločica mape je uspješno preuzeta",
        errorStatus:
          "Dobavljač pločica nije vratio pločicu mape (HTTP status: {{status}}); provjerite URL šablon i API ključ",
        errorNotReachable:
          "Dobavljač pločica nije dostupan; provjerite URL šablon i internet vezu",
      },
    },
    validation: {
      nameRequired: "Naziv je obavezan",
      nameDuplicate: "Naziv već koristi drugi sloj",
      urlRequired: "URL šablon je obavezan",
      urlNotHttps: "URL šablon mora počinjati sa https://",
      urlPlaceholdersMissing:
        "URL šablon mora sadržati čuvare mjesta {x}, {y} i {z}",
      urlSubdomainNotSupported:
        "Čuvar mjesta {s} nije podržan: zamijenite ga jednim od poddomena dobavljača (npr. 'a')",
      apiKeyRequired: "URL šablon sadrži {apiKey}: API ključ je obavezan",
      apiKeyPlaceholderMissing:
        "Dodajte čuvar mjesta {apiKey} u URL šablon, na mjestu gdje se očekuje API ključ",
    },
  },
  mapTypes: {
    standard: "Standardna",
    satellite: "Satelitska",
    hybrid: "Hibridna",
  },
  area: {
    surface: "Površina: {{area}}",
    layer: "Sloj: {{layer}}",
    zoomLevels: "Nivoi zumiranja: {{minZoom}} - {{maxZoom}}",
    tiles: "Pločice: {{downloaded}} / {{total}}",
    size: "Veličina: {{size}}",
    lastUpdate: "Posljednje ažuriranje: {{date}}",
    missingTiles: "Nedostajuće pločice: {{count}}",
    resumeDownload: "Preuzmi nedostajuće",
    deleteConfirm: "Obrisati oblast mape van mreže '{{name}}'?",
    nameRequired: "Naziv je obavezan",
    nameDuplicate: "Naziv već koristi druga oblast",
  },
  areaEditor: {
    title: "Nova oblast mape van mreže",
    name: "Naziv",
    layer: "Sloj",
    maxZoom: "Maksimalno zumiranje: {{value}}",
    currentZoom: "Trenutno zumiranje: {{value}}",
    tooManyTiles:
      "Oblast je prevelika: može se preuzeti najviše {{maxTiles}} pločica; smanjite oblast ili maksimalno zumiranje",
    notEnoughSpace: "Nema dovoljno slobodnog prostora na uređaju",
    steps: {
      name: "Naziv",
      layer: "Sloj mape",
      zoom: "Nivoi zumiranja",
      zoomHint:
        "Veći maksimalni nivoi zumiranja prikazuju više detalja, ali zahtijevaju mnogo više pločica: zumirajte mapu da vidite nivo detalja svakog zumiranja.",
      draw: "Nacrtaj oblast",
      drawSummary:
        "{{area}} · pločice: {{tiles}} · ~{{size}} (slobodno: {{freeSpace}})",
      drawSummaryTooManyTiles:
        "{{area}} · pločice: {{tiles}}, previše (najviše {{maxTiles}})",
      drawSummaryEmpty: "Nacrtajte oblast od interesa na mapi",
      next: "Dalje",
    },
    customLayerConfirm: {
      title: "Prilagođeni sloj mape",
      message:
        "Sa '{{layer}}' biće preuzeto oko {{tiles}} pločica mape. Provjerite da li uslovi korišćenja dobavljača dozvoljavaju masovno preuzimanje: ono može biti zabranjeno ili se naplaćivati. Nastaviti?",
    },
    lowSpaceConfirm: {
      title: "Malo slobodnog prostora",
      message:
        "Preuzimanje će zauzeti oko {{size}}, {{percent}}% slobodnog prostora na uređaju ({{freeSpace}}). Nastaviti?",
    },
  },
  areaViewer: {
    title: "Oblast mape van mreže",
    notFound: "Oblast mape van mreže nije pronađena",
  },
  download: {
    label: "Preuzmi",
    title: "Preuzimanje pločica mape",
    complete: "Oblast mape van mreže je preuzeta ({{size}})",
    completeWithMissingTiles:
      "Oblast mape van mreže je preuzeta ({{size}}); nije bilo moguće preuzeti {{missingTiles}} pločica",
    error: "Greška pri preuzimanju oblasti mape van mreže: {{details}}",
  },
};
