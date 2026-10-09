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
  customLayers: {
    title: "Camadas de mapa personalizadas",
    description:
      "Adicione camadas de mapa de outros fornecedores de mosaicos (mosaicos raster XYZ), com uma chave de API se o fornecedor a exigir. Podem ser selecionadas como camada de mapa predefinida nas definições e com o botão de camadas no mapa. Certifique-se de que os termos de utilização do fornecedor o permitem.",
    add: "Adicionar camada",
    noLayers: "Ainda não há camadas de mapa personalizadas",
    maxZoom: "Zoom máx.: {{value}}",
    deleteConfirm:
      "Eliminar a camada de mapa personalizada '{{name}}' e os seus mosaicos guardados neste dispositivo?",
    editor: {
      title: "Camada de mapa personalizada",
      name: "Nome",
      url: "Modelo de URL",
      urlHint:
        "Exemplo: https://tiles.example.org/{z}/{x}/{y}.png?key={apiKey}\n{x}, {y} e {z} são obrigatórios; {apiKey} é substituído pela chave de API.",
      apiKey: "Chave de API (opcional)",
      apiKeyHint:
        "Guardada no armazenamento seguro do dispositivo e usada apenas nos pedidos ao fornecedor de mosaicos.",
      attribution: "Atribuição (opcional)",
      attributionHint:
        "Aviso de direitos de autor exigido pelo fornecedor; é mostrado no mapa.",
      test: {
        label: "Testar",
        success: "Mosaico de mapa descarregado com sucesso",
        errorStatus:
          "O fornecedor de mosaicos não devolveu um mosaico de mapa (estado HTTP: {{status}}); verifique o modelo de URL e a chave de API",
        errorNotReachable:
          "Não é possível contactar o fornecedor de mosaicos; verifique o modelo de URL e a ligação à internet",
      },
    },
    validation: {
      nameRequired: "O nome é obrigatório",
      nameDuplicate: "Nome já utilizado por outra camada",
      urlRequired: "O modelo de URL é obrigatório",
      urlNotHttps: "O modelo de URL deve começar por https://",
      urlPlaceholdersMissing:
        "O modelo de URL deve conter os marcadores {x}, {y} e {z}",
      urlSubdomainNotSupported:
        "O marcador {s} não é suportado: substitua-o por um dos subdomínios do fornecedor (por ex. 'a')",
      apiKeyRequired:
        "O modelo de URL contém {apiKey}: a chave de API é obrigatória",
      apiKeyPlaceholderMissing:
        "Adicione o marcador {apiKey} ao modelo de URL, onde a chave de API é esperada",
    },
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
    lowSpaceConfirm: {
      title: "Pouco espaço livre",
      message:
        "O download ocupará cerca de {{size}}, {{percent}}% do espaço livre no dispositivo ({{freeSpace}}). Continuar?",
    },
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
