export default {
  title: "Offline-kartat",
  description:
    "Lataa kiinnostuksen kohteena olevan alueen kartta ennen maastoon lähtöä: se on käytettävissä myös ilman internetyhteyttä, kun piirrät tai tarkastelet maantieteellisiä attribuutteja.",
  freeLayersNotInUse:
    "Offline-karttoja käytetään vain, kun asetuksissa karttapalveluksi on valittu 'Free map layers'.",
  useFreeLayers: "Käytä ilmaisia karttatasoja",
  offlineMode: "Offline",
  addArea: "Lisää alue",
  deleteAll: "Poista kaikki",
  deleteAllConfirm:
    "Poistetaanko kaikki offline-kartta-alueet ja kaikki tälle laitteelle tallennetut karttaruudut?",
  clearCache: "Tyhjennä karttojen välimuisti",
  clearCacheConfirm:
    "Poistetaanko kaikki tälle laitteelle tallennetut karttaruudut (karttoja selattaessa välimuistiin tallennetut ruudut)?",
  noAreas: "Offline-kartta-alueita ei ole vielä ladattu",
  storage: {
    used: "Karttaruutujen käyttämä tila (ladatut alueet ja välimuisti):",
    free: "Vapaa tila laitteessa:",
  },
  layers: {
    esriWorldImagery: "Satelliitti (Esri World Imagery)",
    openTopoMap: "Topografinen (OpenTopoMap)",
    openStreetMap: "Vakio (OpenStreetMap, vain verkossa)",
  },
  customLayers: {
    title: "Mukautetut karttatasot",
    description:
      "Lisää karttatasoja muilta karttaruutujen tarjoajilta (XYZ-rasteriruudut), API-avaimella jos tarjoaja vaatii sen. Ne voi valita oletuskarttatasoksi asetuksissa ja kartan tasopainikkeella. Varmista, että tarjoajan käyttöehdot sallivat tämän.",
    add: "Lisää taso",
    noLayers: "Mukautettuja karttatasoja ei ole vielä määritetty",
    maxZoom: "Suurin zoomaus: {{value}}",
    deleteConfirm:
      "Poistetaanko mukautettu karttataso '{{name}}' ja sen tälle laitteelle tallennetut karttaruudut?",
    editor: {
      title: "Mukautettu karttataso",
      name: "Nimi",
      url: "URL-malli",
      urlHint:
        "Esimerkki: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} ja {z} ovat pakollisia; {apiKey} korvataan API-avaimella.",
      apiKey: "API-avain (valinnainen)",
      apiKeyHint:
        "Tallennetaan laitteen suojattuun tallennustilaan ja käytetään vain pyynnöissä karttaruutujen tarjoajalle.",
      attribution: "Lähdemerkintä (valinnainen)",
      attributionHint:
        "Tarjoajan vaatima tekijänoikeusmerkintä; se näytetään kartalla.",
      test: {
        label: "Testaa",
        success: "Karttaruudun lataus onnistui",
        errorStatus:
          "Tarjoaja ei palauttanut karttaruutua (HTTP-tila: {{status}}); tarkista URL-malli ja API-avain",
        errorNotReachable:
          "Tarjoajaan ei saada yhteyttä; tarkista URL-malli ja internetyhteys",
      },
    },
    validation: {
      nameRequired: "Nimi on pakollinen",
      nameDuplicate: "Nimi on jo toisen tason käytössä",
      urlRequired: "URL-malli on pakollinen",
      urlNotHttps: "URL-mallin on alettava merkkijonolla https://",
      urlPlaceholdersMissing:
        "URL-mallin on sisällettävä paikkamerkit {x}, {y} ja {z}",
      urlSubdomainNotSupported:
        "Paikkamerkkiä {s} ei tueta: korvaa se jollakin tarjoajan aliverkkotunnuksista (esim. 'a')",
      apiKeyRequired:
        "URL-malli sisältää paikkamerkin {apiKey}: API-avain on pakollinen",
      apiKeyPlaceholderMissing:
        "Lisää paikkamerkki {apiKey} URL-malliin kohtaan, jossa API-avainta odotetaan",
    },
  },
  mapTypes: {
    standard: "Vakio",
    satellite: "Satelliitti",
    hybrid: "Hybridi",
  },
  area: {
    surface: "Pinta-ala: {{area}}",
    layer: "Taso: {{layer}}",
    zoomLevels: "Zoomaustasot: {{minZoom}} - {{maxZoom}}",
    tiles: "Karttaruudut: {{downloaded}} / {{total}}",
    size: "Koko: {{size}}",
    lastUpdate: "Viimeksi päivitetty: {{date}}",
    missingTiles: "Puuttuvat karttaruudut: {{count}}",
    resumeDownload: "Lataa puuttuvat",
    deleteConfirm: "Poistetaanko offline-kartta-alue '{{name}}'?",
    nameRequired: "Nimi on pakollinen",
    nameDuplicate: "Nimi on jo toisen alueen käytössä",
  },
  areaEditor: {
    title: "Uusi offline-kartta-alue",
    name: "Nimi",
    layer: "Taso",
    maxZoom: "Suurin zoomaus: {{value}}",
    currentZoom: "Nykyinen zoomaus: {{value}}",
    surface: "Pinta-ala: {{area}}",
    drawAreaToEstimate:
      "Piirrä kiinnostuksen kohteena oleva alue kartalle nähdäksesi sen viemän tilan",
    estimate: "{{tiles}} karttaruutua · ~{{size}} (vapaa tila: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} karttaruutua: liikaa (enintään {{maxTiles}}); pienennä aluetta tai suurinta zoomausta",
    tooManyTiles:
      "Alue on liian suuri: enintään {{maxTiles}} karttaruutua voidaan ladata; pienennä aluetta tai suurinta zoomausta",
    notEnoughSpace: "Laitteessa ei ole tarpeeksi vapaata tilaa",
    lowSpaceConfirm: {
      title: "Vapaa tila vähissä",
      message:
        "Lataus vie noin {{size}}, {{percent}} % laitteen vapaasta tilasta ({{freeSpace}}). Jatketaanko?",
    },
  },
  areaViewer: {
    title: "Offline-kartta-alue",
    notFound: "Offline-kartta-aluetta ei löytynyt",
  },
  download: {
    label: "Lataa",
    title: "Ladataan karttaruutuja",
    complete: "Offline-kartta-alue ladattu ({{size}})",
    completeWithMissingTiles:
      "Offline-kartta-alue ladattu ({{size}}); {{missingTiles}} karttaruutua ei voitu ladata",
    error: "Virhe ladattaessa offline-kartta-aluetta: {{details}}",
  },
};
