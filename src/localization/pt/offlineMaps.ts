export default {
  title: "Mapas offline",
  description:
    "Baixe o mapa da sua área de interesse antes de ir a campo: ele estará disponível mesmo sem conexão com a internet ao desenhar ou visualizar atributos geográficos.",
  freeLayersNotInUse:
    "Os mapas offline são usados somente quando o provedor de mapas nas configurações é 'Free map layers'.",
  useFreeLayers: "Usar camadas de mapa gratuitas",
  offlineMode: "Offline",
  addArea: "Adicionar área",
  deleteAll: "Excluir tudo",
  deleteAllConfirm:
    "Excluir todas as áreas de mapa offline e todos os blocos de mapa armazenados neste dispositivo?",
  clearCache: "Limpar cache de mapas",
  clearCacheConfirm:
    "Excluir todos os blocos de mapa armazenados neste dispositivo (blocos em cache ao navegar pelos mapas)?",
  noAreas: "Nenhuma área de mapa offline baixada ainda",
  storage: {
    used: "Espaço usado pelos blocos de mapa (áreas baixadas e cache):",
    free: "Espaço livre no dispositivo:",
  },
  layers: {
    esriWorldImagery: "Satélite (Esri World Imagery)",
    openTopoMap: "Topográfico (OpenTopoMap)",
    openStreetMap: "Padrão (OpenStreetMap, somente online)",
  },
  mapTypes: {
    standard: "Padrão",
    satellite: "Satélite",
    hybrid: "Híbrido",
  },
  area: {
    surface: "Área: {{area}}",
    layer: "Camada: {{layer}}",
    zoomLevels: "Níveis de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Blocos: {{downloaded}} / {{total}}",
    size: "Tamanho: {{size}}",
    lastUpdate: "Última atualização: {{date}}",
    missingTiles: "Blocos ausentes: {{count}}",
    resumeDownload: "Baixar ausentes",
    deleteConfirm: "Excluir a área de mapa offline '{{name}}'?",
    nameRequired: "O nome é obrigatório",
    nameDuplicate: "Nome já usado por outra área",
  },
  areaEditor: {
    title: "Nova área de mapa offline",
    name: "Nome",
    layer: "Camada",
    maxZoom: "Zoom máximo: {{value}}",
    currentZoom: "Zoom atual: {{value}}",
    surface: "Área: {{area}}",
    drawAreaToEstimate:
      "Desenhe a área de interesse no mapa para ver o espaço que ela ocupará",
    estimate: "{{tiles}} blocos · ~{{size}} (espaço livre: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} blocos: demais (máx. {{maxTiles}}); reduza a área ou o zoom máximo",
    tooManyTiles:
      "A área é grande demais: no máximo {{maxTiles}} blocos podem ser baixados; reduza a área ou o zoom máximo",
    notEnoughSpace: "Espaço livre insuficiente no dispositivo",
  },
  areaViewer: {
    title: "Área de mapa offline",
    notFound: "Área de mapa offline não encontrada",
  },
  download: {
    label: "Baixar",
    title: "Baixando blocos de mapa",
    complete: "Área de mapa offline baixada ({{size}})",
    completeWithMissingTiles:
      "Área de mapa offline baixada ({{size}}); não foi possível baixar {{missingTiles}} blocos",
    error: "Erro ao baixar a área de mapa offline: {{details}}",
  },
};
