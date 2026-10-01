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
