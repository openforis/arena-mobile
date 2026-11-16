export default {
  title: "Mapas importados",
  description:
    "Importe mapas de arquivos PDF ou GeoTIFF geoespaciais (georreferenciados) armazenados neste dispositivo: eles são exibidos sobre o mapa base em todos os mapas do aplicativo, mesmo sem conexão com a internet.",
  rendererNotAvailable:
    "Os mapas importados não são compatíveis com esta versão do aplicativo: atualize-o para a versão mais recente",
  importMap: "Importar mapa",
  noMaps: "Nenhum mapa importado ainda",
  storage: {
    used: "Espaço usado pelos mapas importados:",
  },
  opacity: "Opacidade: {{value}}%",
  hideBaseMap: "Somente mapa importado",
  map: {
    fileName: "Arquivo: {{fileName}}",
    page: "Página: {{page}}",
    zoomLevels: "Níveis de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Blocos: {{count}}",
    size: "Tamanho: {{size}} (arquivo PDF: {{sourceSize}})",
    sizeTilesOnly: "Tamanho: {{size}}",
    datumWarning:
      "O datum do mapa não é WGS84: o mapa pode estar deslocado alguns metros",
    visible: "Mostrar nos mapas",
    deleteConfirm: "Excluir o mapa '{{name}}'?",
    notFound: "Mapa não encontrado",
    viewerTitle: "Mapa importado",
  },
  import: {
    title: "Importar mapa",
    analyzing: "Lendo o georreferenciamento do arquivo...",
    errorReading: "Erro ao ler o arquivo: {{details}}",
    notGeoreferenced:
      "O arquivo não está georreferenciado: ele não contém as coordenadas geográficas do mapa",
    unsupportedGeoreference:
      "O georreferenciamento deste arquivo PDF (codificação OGC GeoPDF) ainda não é compatível",
    unsupportedFile: "O arquivo não é um PDF nem um GeoTIFF",
    unsupportedGeoTiffFormat:
      "As imagens deste arquivo GeoTIFF não são compatíveis ({{details}}): só podem ser importadas imagens com 8 bits por amostra (RGB, RGBA, escala de cinza ou com paleta de cores)",
    page: "Página",
    pageItem: "Página {{page}}",
    name: "Nome",
    maxZoom: "Zoom máx.: {{value}}",
    nativeZoom: "(resolução do mapa: {{value}})",
    maxZoomAboveNative:
      "Níveis de zoom acima da resolução do mapa ficarão desfocados",
    estimate: "{{tiles}} blocos · ~{{size}} (espaço livre: {{freeSpace}})",
    estimateTooManyTiles:
      "{{tiles}} blocos: demais (máx. {{maxTiles}}); reduza o zoom máximo",
    tooManyTiles:
      "Blocos demais: no máximo {{maxTiles}} blocos podem ser gerados; reduza o zoom máximo",
    notEnoughSpace: "Espaço livre insuficiente no dispositivo",
    lowSpaceConfirm: {
      title: "Pouco espaço livre",
      message:
        "O mapa usará cerca de {{size}}, {{percent}}% do espaço livre do dispositivo ({{freeSpace}}). Continuar?",
    },
    preview: {
      rendering: "Gerando a pré-visualização...",
      lowResolution:
        "Pré-visualização em baixa resolução (níveis de zoom {{minZoom}} - {{maxZoom}})",
      error: "Pré-visualização indisponível: {{details}}",
    },
    importButton: "Importar",
    jobTitle: "Importando o mapa",
    complete: "Mapa importado ({{size}})",
    error: "Erro ao importar o mapa: {{details}}",
  },
  validation: {
    nameRequired: "O nome é obrigatório",
    nameDuplicate: "Nome já usado por outro mapa importado",
  },
};
