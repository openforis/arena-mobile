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
