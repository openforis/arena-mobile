export default {
  title: "Definições",
  animationsEnabled: {
    label: "Animações ativadas",
    description:
      "Ativa as animações de transição e de interface em toda a aplicação. Desative para melhorar o desempenho em dispositivos mais lentos",
  },
  connectionToServer: "Ligação ao servidor",
  fontScale: {
    label: "Escala de fonte: {{value}}",
    description: "Ajusta o tamanho do texto utilizado em toda a aplicação",
  },
  keepScreenAwake: {
    label: "Manter ecrã ativo",
    description:
      "Impede que o ecrã se desligue automaticamente enquanto a aplicação estiver aberta",
  },
  fullScreen: {
    label: "Ecrã completo",
    description:
      "Oculta as barras de estado e navegação do sistema para usar todo o ecrã na introdução de dados",
  },
  imageSizeLimit: {
    label: "Tamanho das imagens limitado a: {{value}}MB",
    description:
      "Tamanho máximo a que as imagens são redimensionadas antes de serem guardadas, a menos que o inquérito defina um limite menor para um atributo específico",
  },
  imageSizeUnlimited: {
    label: "Tamanho das imagens ilimitado",
    description:
      "As imagens serão armazenadas na resolução máxima fornecida pelo dispositivo, a menos que um limite seja definido no designer do formulário da pesquisa.",
  },
  language: {
    label: "Idioma da aplicação",
    description: "Define o idioma utilizado na interface da aplicação",
  },
  locationAccuracyThreshold: {
    label: "Limite de precisão da localização (metros)",
    description:
      "Precisão mínima do GPS, em metros, necessária antes de uma leitura de localização ser aceite para um atributo de coordenadas",
  },
  locationAccuracyWatchTimeout: {
    label:
      "Tempo limite de verificação da precisão da localização: {{value}} segundos",
    description:
      "Tempo máximo de espera por uma leitura de localização que satisfaça o limite de precisão antes de desistir",
  },
  locationAveragingEnabled: {
    label: "Média de localização ativada",
    description:
      "Quando ativada, a localização registada será a média de múltiplas leituras de localização, melhorando a precisão",
  },
  locationGpsLocked: {
    label: "GPS bloqueado",
    description:
      "Aviso: o consumo da bateria irá aumentar!\nO sinal de GPS será bloqueado quando a aplicação estiver em execução.\nIsto ajudará a obter uma melhor precisão nos atributos de coordenadas.",
    error:
      "Não é possível iniciar o bloqueio de GPS: fornecedor de localização não disponível ou acesso à localização não concedido",
  },
  gpsDevicePairing: {
    title: "Emparelhar um dispositivo GPS",
    scanButton: "Procurar dispositivos",
    scanningLabel: "A procurar dispositivos próximos…",
    scanAgainButton: "Procurar novamente",
    emptyResult:
      "Nenhum dispositivo encontrado. Certifique-se de que o seu recetor GPS está ligado e em modo de emparelhamento.",
    scanFailed: "Ocorreu um erro durante a pesquisa. Tente novamente.",
    recognizedDevicesNotice:
      "Apenas os dispositivos reconhecidos como recetores GPS são apresentados.",
    pairedDevicesTitle: "Dispositivos emparelhados",
    newDevicesTitle: "Novos dispositivos",
    pairButton: "Emparelhar",
    pairing: "A emparelhar…",
    pairingSucceeded: "Emparelhado com {{name}}",
    pairingFailed: "Não foi possível emparelhar com {{name}}",
    bluetoothDisabled: "O Bluetooth está desativado.",
    enableBluetoothButton: "Ativar Bluetooth",
    permissionDenied:
      "É necessária a permissão de Bluetooth para procurar dispositivos.",
    openSettingsButton: "Abrir definições da aplicação",
  },
  preferredGpsSourceId: {
    label: "Fonte GPS",
    description:
      "Escolha qual GPS é usado para registar coordenadas: o GPS interno do telemóvel ou um recetor GPS externo emparelhado (por exemplo, Bad Elf).",
    auto: "Automático (externo se disponível)",
    internal: "GPS interno",
    pairNewDevice: "Emparelhar um novo dispositivo…",
  },
  showRecordCompletion: {
    label: "Mostrar progresso de conclusão do registo",
    description:
      "Mostra uma barra de progresso com a percentagem de campos obrigatórios preenchidos no registo atual",
  },
  showStatusBar: {
    label: "Mostrar barra de estado",
    description:
      "Mostra o estado da bateria, do armazenamento e da rede durante a edição de um registo",
  },
  theme: {
    label: "Tema",
    description: "Define o tema de cores utilizado na interface da aplicação",
    auto: "Automático",
    dark: "Escuro",
    dark2: "Escuro 2",
    light: "Claro",
    light2: "Claro 2",
  },
};
