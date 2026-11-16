export default {
  title: "PDF-kartat",
  description:
    "Tuo karttoja tähän laitteeseen tallennetuista paikkatieto-PDF-tiedostoista (georeferoiduista): ne näytetään taustakartan päällä kaikissa sovelluksen kartoissa, myös ilman internetyhteyttä.",
  rendererNotAvailable:
    "Tämä sovelluksen versio ei tue PDF-karttoja: päivitä sovellus uusimpaan versioon",
  importPdf: "Tuo PDF",
  noMaps: "PDF-karttoja ei ole vielä tuotu",
  storage: {
    used: "PDF-karttojen käyttämä tila:",
  },
  opacity: "Peittävyys: {{value}} %",
  hideBaseMap: "Vain PDF",
  map: {
    fileName: "Tiedosto: {{fileName}}",
    page: "Sivu: {{page}}",
    zoomLevels: "Zoomaustasot: {{minZoom}} - {{maxZoom}}",
    tiles: "Karttaruudut: {{count}}",
    size: "Koko: {{size}} (PDF-tiedosto: {{sourceSize}})",
    datumWarning:
      "Kartan datum ei ole WGS84: kartta voi olla siirtynyt muutamia metrejä",
    visible: "Näytä kartoilla",
    deleteConfirm: "Poistetaanko PDF-kartta '{{name}}'?",
    notFound: "PDF-karttaa ei löytynyt",
    viewerTitle: "PDF-kartta",
  },
  import: {
    title: "Tuo PDF-kartta",
    analyzing: "Luetaan PDF-tiedoston georeferointia...",
    errorReading: "Virhe luettaessa PDF-tiedostoa: {{details}}",
    notGeoreferenced:
      "PDF-tiedostoa ei ole georeferoitu: se ei sisällä kartan maantieteellisiä koordinaatteja",
    unsupportedGeoreference:
      "Tämän PDF-tiedoston georeferointia (OGC GeoPDF -koodaus) ei vielä tueta",
    page: "Sivu",
    pageItem: "Sivu {{page}}",
    name: "Nimi",
    maxZoom: "Suurin zoomaus: {{value}}",
    nativeZoom: "(PDF:n resoluutio: {{value}})",
    maxZoomAboveNative:
      "PDF:n resoluutiota suuremmat zoomaustasot näyttävät sumeilta",
    estimate: "{{tiles}} karttaruutua · ~{{size}} (vapaa tila: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} karttaruutua: liikaa (enintään {{maxTiles}}); pienennä suurinta zoomausta",
    tooManyTiles:
      "Liikaa karttaruutuja: enintään {{maxTiles}} karttaruutua voidaan luoda; pienennä suurinta zoomausta",
    notEnoughSpace: "Laitteessa ei ole tarpeeksi vapaata tilaa",
    lowSpaceConfirm: {
      title: "Vähän vapaata tilaa",
      message:
        "Kartta vie noin {{size}}, {{percent}} % laitteen vapaasta tilasta ({{freeSpace}}). Jatketaanko?",
    },
    preview: {
      rendering: "Luodaan esikatselua...",
      lowResolution:
        "Esikatselu matalalla resoluutiolla (zoomaustasot {{minZoom}} - {{maxZoom}})",
      error: "Esikatselu ei ole käytettävissä: {{details}}",
    },
    importButton: "Tuo",
    jobTitle: "Tuodaan PDF-karttaa",
    complete: "PDF-kartta tuotu ({{size}})",
    error: "Virhe tuotaessa PDF-karttaa: {{details}}",
  },
  validation: {
    nameRequired: "Nimi on pakollinen",
    nameDuplicate: "Nimi on jo toisen PDF-kartan käytössä",
  },
};
