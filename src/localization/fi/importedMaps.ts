export default {
  title: "Tuodut kartat",
  description:
    "Tuo karttoja tähän laitteeseen tallennetuista paikkatieto-PDF- tai GeoTIFF-tiedostoista (georeferoiduista): ne näytetään taustakartan päällä kaikissa sovelluksen kartoissa, myös ilman internetyhteyttä.",
  rendererNotAvailable:
    "Tämä sovelluksen versio ei tue tuotuja karttoja: päivitä sovellus uusimpaan versioon",
  importMap: "Tuo kartta",
  noMaps: "Karttoja ei ole vielä tuotu",
  storage: {
    used: "Tuotujen karttojen käyttämä tila:",
  },
  opacity: "Peittävyys: {{value}} %",
  hideBaseMap: "Vain tuotu kartta",
  map: {
    fileName: "Tiedosto: {{fileName}}",
    page: "Sivu: {{page}}",
    zoomLevels: "Zoomaustasot: {{minZoom}} - {{maxZoom}}",
    tiles: "Karttaruudut: {{count}}",
    size: "Koko: {{size}} (PDF-tiedosto: {{sourceSize}})",
    sizeTilesOnly: "Koko: {{size}}",
    datumWarning:
      "Kartan datum ei ole WGS84: kartta voi olla siirtynyt muutamia metrejä",
    visible: "Näytä kartoilla",
    deleteConfirm: "Poistetaanko kartta '{{name}}'?",
    notFound: "Karttaa ei löytynyt",
    viewerTitle: "Tuotu kartta",
  },
  import: {
    title: "Tuo kartta",
    analyzing: "Luetaan tiedoston georeferointia...",
    errorReading: "Virhe luettaessa tiedostoa: {{details}}",
    notGeoreferenced:
      "Tiedostoa ei ole georeferoitu: se ei sisällä kartan maantieteellisiä koordinaatteja",
    unsupportedGeoreference:
      "Tämän PDF-tiedoston georeferointia (OGC GeoPDF -koodaus) ei vielä tueta",
    unsupportedFile: "Tiedosto ei ole PDF- eikä GeoTIFF-tiedosto",
    unsupportedGeoTiffFormat:
      "Tämän GeoTIFF-tiedoston kuvia ei tueta ({{details}}): vain kuvia, joissa on 8 bittiä näytettä kohden (RGB, RGBA, harmaasävy tai väripaletti), voidaan tuoda",
    page: "Sivu",
    pageItem: "Sivu {{page}}",
    name: "Nimi",
    maxZoom: "Suurin zoomaus: {{value}}",
    nativeZoom: "(kartan resoluutio: {{value}})",
    maxZoomAboveNative:
      "Kartan resoluutiota suuremmat zoomaustasot näyttävät sumeilta",
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
    jobTitle: "Tuodaan karttaa",
    complete: "Kartta tuotu ({{size}})",
    error: "Virhe tuotaessa karttaa: {{details}}",
  },
  validation: {
    nameRequired: "Nimi on pakollinen",
    nameDuplicate: "Nimi on jo toisen tuodun kartan käytössä",
  },
};
