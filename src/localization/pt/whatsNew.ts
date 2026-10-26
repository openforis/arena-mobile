export default {
  title: "Novidades",
  since: "Desde a versão {{version}}",
  dontShowAgain: "Não mostrar novamente",
  items: {
    geoAttribute: {
      title: "Atributo geoespacial: desenhar polígonos",
      description: "Os inquéritos podem agora incluir atributos **geoespaciais**. No formulário, toque em **Desenhar polígono** e toque no mapa para adicionar os pontos do limite (ou, ao percorrê-lo, use **Adicionar localização atual**), depois prima **Parar**.\n\nToque num ponto para o selecionar e arrastar, toque num ponto intermédio para adicionar um novo ponto e depois **Salvar**. O polígono também pode ser transferido em formato GeoJSON.",
    },
    offlineMaps: {
      title: "Mapas offline",
      description: "Abra **Mapas offline** no menu principal e use **Adicionar área** para transferir o mapa da sua área de interesse antes de ir para o campo: estará disponível mesmo sem ligação à internet.\n\nNo separador **Mapas PDF** também pode importar mapas PDF georreferenciados: são mostrados por cima do mapa base.",
    },
    recordsMap: {
      title: "Registos no mapa",
      description: "Na lista de registos, toque no botão **mapa** no topo para ver os seus dados no mapa: os pontos de amostragem (visitados ou não), as localizações registadas nos atributos de coordenadas e os percursos de posição.\n\nUse **Camadas** para escolher o que mostrar e toque num ponto para ver os detalhes e **Abrir** o registo.",
    },
    autoSync: {
      title: "Sincronização automática de dados",
      description: "Ative **Sincronização automática** na parte inferior da lista de registos (ou nas **Definições**): quando estiver ligado ao servidor, os registos novos e alterados são enviados automaticamente em segundo plano, sem ter de os enviar manualmente.\n\nToque no ícone do estado da sincronização ao lado para acompanhar o progresso ou para **Sincronizar agora**.",
    },
    externalGps: {
      title: "Dispositivos GPS externos",
      description: "Use um recetor GPS Bluetooth (por ex. Bad Elf) para obter coordenadas mais precisas: em **Definições > Localização e GPS**, abra **Fonte GPS** e escolha **Emparelhar um novo dispositivo…**.\n\nCom **Automático**, o GPS externo é usado sempre que estiver ligado; caso contrário, o GPS interno do dispositivo.",
    },
  },
};
