export default {
  title: "Ajustes",
  animationsEnabled: "Animaciones activadas",
  connectionToServer: "Conexión al servidor",
  fontScale: "Escala de fuente: {{value}}",
  keepScreenAwake: "Mantener pantalla activa",
  fullScreen: "Pantalla completa",
  imageSizeLimit: "Tamaño de imágenes limitado a: {{value}}MB",
  imageSizeUnlimited: {
    label: "Tamaño de imágenes ilimitado",
    description:
      "Las imágenes se almacenarán con la máxima resolución proporcionada por el dispositivo, a menos que se establezca un límite en el diseñador del formulario de encuesta.",
  },
  language: {
    label: "Idioma de la aplicación",
  },
  locationAccuracyThreshold: "Precisión de la ubicación (metros)",
  locationAccuracyWatchTimeout:
    "Tiempo de espera de la precisión de la ubicación: {{value}} segundos",
  locationAveragingEnabled: {
    label: "Promedio de ubicación activado",
    description:
      "Cuando está activado, la ubicación registrada será el promedio de múltiples lecturas de ubicación, mejorando la precisión",
  },
  locationGpsLocked: {
    label: "GPS bloqueado",
    description:
      "Advertencia: ¡el consumo de batería aumentará!\nLa señal GPS se bloqueará cuando la aplicación esté en ejecución.\nAyudará a obtener una mejor precisión en los atributos de coordenadas.",
    error:
      "No se puede iniciar el bloqueo del GPS: proveedor de ubicación no disponible o acceso a la ubicación no concedido",
  },
  gpsDevicePairing: {
    title: "Emparejar un dispositivo GPS",
    scanButton: "Buscar dispositivos",
    scanningLabel: "Buscando dispositivos cercanos…",
    scanAgainButton: "Buscar de nuevo",
    emptyResult:
      "No se encontraron dispositivos. Asegúrese de que su receptor GPS esté encendido y en modo de emparejamiento.",
    scanFailed: "Algo salió mal durante la búsqueda. Inténtelo de nuevo.",
    recognizedDevicesNotice:
      "Solo se muestran los dispositivos reconocidos como receptores GPS.",
    pairedDevicesTitle: "Dispositivos emparejados",
    newDevicesTitle: "Nuevos dispositivos",
    pairButton: "Emparejar",
    pairing: "Emparejando…",
    pairingSucceeded: "Emparejado con {{name}}",
    pairingFailed: "No se pudo emparejar con {{name}}",
    bluetoothDisabled: "El Bluetooth está desactivado.",
    enableBluetoothButton: "Activar Bluetooth",
    permissionDenied:
      "Se requiere permiso de Bluetooth para buscar dispositivos.",
    openSettingsButton: "Abrir configuración de la aplicación",
  },
  preferredGpsSourceId: {
    label: "Fuente GPS",
    description:
      "Elija qué GPS se utiliza para registrar coordenadas: el GPS interno del teléfono o un receptor GPS externo emparejado (por ejemplo, Bad Elf).",
    auto: "Automático (externo si está disponible)",
    internal: "GPS interno",
    pairNewDevice: "Emparejar un nuevo dispositivo…",
  },
  showStatusBar: "Mostrar barra de estado",
  theme: {
    label: "Tema",
    auto: "Automático",
    dark: "Oscuro",
    dark2: "Oscuro 2",
    light: "Claro",
    light2: "Claro 2",
  },
};
