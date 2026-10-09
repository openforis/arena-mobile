export default {
  title: "Offlinekartor",
  description:
    "Ladda ner kartan över ditt intresseområde innan du går ut i fält: den är tillgänglig även utan internetanslutning när du ritar eller visar geografiska attribut.",
  freeLayersNotInUse:
    "Offlinekartor används bara när kartleverantören i inställningarna är 'Free map layers'.",
  useFreeLayers: "Använd kostnadsfria kartlager",
  offlineMode: "Offline",
  addArea: "Lägg till område",
  deleteAll: "Ta bort alla",
  deleteAllConfirm:
    "Ta bort alla offlinekartområden och alla kartrutor som är lagrade på den här enheten?",
  clearCache: "Rensa kartcache",
  clearCacheConfirm:
    "Ta bort alla kartrutor som är lagrade på den här enheten (rutor som cachats när kartorna visats)?",
  noAreas: "Inga offlinekartområden har laddats ner ännu",
  storage: {
    used: "Utrymme som används av kartrutor (nedladdade områden och cache):",
    free: "Ledigt utrymme på enheten:",
  },
  layers: {
    esriWorldImagery: "Satellit (Esri World Imagery)",
    openTopoMap: "Topografisk (OpenTopoMap)",
    openStreetMap: "Standard (OpenStreetMap, endast online)",
  },
  customLayers: {
    title: "Anpassade kartlager",
    description:
      "Lägg till kartlager från andra leverantörer av kartrutor (XYZ-rasterrutor), med en API-nyckel om leverantören kräver det. De kan väljas som standardkartlager i inställningarna och med lagerknappen på kartan. Kontrollera att leverantörens användarvillkor tillåter det.",
    add: "Lägg till lager",
    noLayers: "Inga anpassade kartlager har definierats ännu",
    maxZoom: "Max zoom: {{value}}",
    deleteConfirm:
      "Ta bort det anpassade kartlagret '{{name}}' och dess kartrutor som lagras på den här enheten?",
    editor: {
      title: "Anpassat kartlager",
      name: "Namn",
      url: "URL-mall",
      urlHint:
        "Exempel: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} och {z} krävs; {apiKey} ersätts med API-nyckeln.",
      apiKey: "API-nyckel (valfri)",
      apiKeyHint:
        "Lagras i enhetens säkra lagring och används endast i förfrågningar till leverantören av kartrutor.",
      attribution: "Attribution (valfri)",
      attributionHint:
        "Upphovsrättsmeddelande som leverantören kräver; det visas på kartan.",
      test: {
        label: "Testa",
        success: "Kartrutan laddades ned",
        errorStatus:
          "Leverantören returnerade ingen kartruta (HTTP-status: {{status}}); kontrollera URL-mallen och API-nyckeln",
        errorNotReachable:
          "Leverantören kan inte nås; kontrollera URL-mallen och internetanslutningen",
      },
    },
    validation: {
      nameRequired: "Namn krävs",
      nameDuplicate: "Namnet används redan av ett annat lager",
      urlRequired: "URL-mall krävs",
      urlNotHttps: "URL-mallen måste börja med https://",
      urlPlaceholdersMissing:
        "URL-mallen måste innehålla platshållarna {x}, {y} och {z}",
      urlSubdomainNotSupported:
        "Platshållaren {s} stöds inte: ersätt den med en av leverantörens underdomäner (t.ex. 'a')",
      apiKeyRequired: "URL-mallen innehåller {apiKey}: API-nyckeln krävs",
      apiKeyPlaceholderMissing:
        "Lägg till platshållaren {apiKey} i URL-mallen, där API-nyckeln förväntas",
    },
  },
  mapTypes: {
    standard: "Standard",
    satellite: "Satellit",
    hybrid: "Hybrid",
  },
  area: {
    surface: "Yta: {{area}}",
    layer: "Lager: {{layer}}",
    zoomLevels: "Zoomnivåer: {{minZoom}} - {{maxZoom}}",
    tiles: "Kartrutor: {{downloaded}} / {{total}}",
    size: "Storlek: {{size}}",
    lastUpdate: "Senast uppdaterad: {{date}}",
    missingTiles: "Saknade kartrutor: {{count}}",
    resumeDownload: "Ladda ner saknade",
    deleteConfirm: "Ta bort offlinekartområdet '{{name}}'?",
    nameRequired: "Namn krävs",
    nameDuplicate: "Namnet används redan av ett annat område",
  },
  areaEditor: {
    title: "Nytt offlinekartområde",
    name: "Namn",
    layer: "Lager",
    maxZoom: "Max zoom: {{value}}",
    currentZoom: "Aktuell zoom: {{value}}",
    surface: "Yta: {{area}}",
    drawAreaToEstimate:
      "Rita intresseområdet på kartan för att se hur mycket utrymme det kommer att ta",
    estimate: "{{tiles}} kartrutor · ~{{size}} (ledigt utrymme: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} kartrutor: för många (max {{maxTiles}}); minska området eller max zoom",
    tooManyTiles:
      "Området är för stort: högst {{maxTiles}} kartrutor kan laddas ner; minska området eller max zoom",
    notEnoughSpace: "Inte tillräckligt med ledigt utrymme på enheten",
    lowSpaceConfirm: {
      title: "Lite ledigt utrymme",
      message:
        "Nedladdningen använder cirka {{size}}, {{percent}} % av det lediga utrymmet på enheten ({{freeSpace}}). Fortsätta?",
    },
  },
  areaViewer: {
    title: "Offlinekartområde",
    notFound: "Offlinekartområdet hittades inte",
  },
  download: {
    label: "Ladda ner",
    title: "Laddar ner kartrutor",
    complete: "Offlinekartområdet har laddats ner ({{size}})",
    completeWithMissingTiles:
      "Offlinekartområdet har laddats ner ({{size}}); {{missingTiles}} kartrutor kunde inte laddas ner",
    error: "Fel vid nedladdning av offlinekartområdet: {{details}}",
  },
};
