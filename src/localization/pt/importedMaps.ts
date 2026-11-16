export default {
  title: "Mapas PDF",
  description:
    "Importe mapas de arquivos PDF geoespaciais (georreferenciados) armazenados neste dispositivo: eles são exibidos sobre o mapa base em todos os mapas do aplicativo, mesmo sem conexão com a internet.",
  rendererNotAvailable:
    "Os mapas PDF não são compatíveis com esta versão do aplicativo: atualize-o para a versão mais recente",
  importPdf: "Importar PDF",
  noMaps: "Nenhum mapa PDF importado ainda",
  storage: {
    used: "Espaço usado pelos mapas PDF:",
  },
  opacity: "Opacidade: {{value}}%",
  hideBaseMap: "Somente PDF",
  map: {
    fileName: "Arquivo: {{fileName}}",
    page: "Página: {{page}}",
    zoomLevels: "Níveis de zoom: {{minZoom}} - {{maxZoom}}",
    tiles: "Blocos: {{count}}",
    size: "Tamanho: {{size}} (arquivo PDF: {{sourceSize}})",
    datumWarning:
      "O datum do mapa não é WGS84: o mapa pode estar deslocado alguns metros",
    visible: "Mostrar nos mapas",
    deleteConfirm: "Excluir o mapa PDF '{{name}}'?",
    notFound: "Mapa PDF não encontrado",
    viewerTitle: "Mapa PDF",
  },
  import: {
    title: "Importar mapa PDF",
    analyzing: "Lendo o georreferenciamento do arquivo PDF...",
    errorReading: "Erro ao ler o arquivo PDF: {{details}}",
    notGeoreferenced:
      "O arquivo PDF não está georreferenciado: ele não contém as coordenadas geográficas do mapa",
    unsupportedGeoreference:
      "O georreferenciamento deste arquivo PDF (codificação OGC GeoPDF) ainda não é compatível",
    page: "Página",
    pageItem: "Página {{page}}",
    name: "Nome",
    maxZoom: "Zoom máx.: {{value}}",
    nativeZoom: "(resolução do PDF: {{value}})",
    maxZoomAboveNative:
      "Níveis de zoom acima da resolução do PDF ficarão desfocados",
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
    jobTitle: "Importando mapa PDF",
    complete: "Mapa PDF importado ({{size}})",
    error: "Erro ao importar o mapa PDF: {{details}}",
  },
  validation: {
    nameRequired: "O nome é obrigatório",
    nameDuplicate: "Nome já usado por outro mapa PDF",
  },
};
