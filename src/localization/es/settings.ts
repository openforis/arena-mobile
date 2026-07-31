export default {
  title: "Ajustes",
  group: {
    appearance: "Apariencia",
    dataEntry: "Entrada de datos",
    location: "Ubicación y GPS",
    images: "Imágenes",
  },
  animationsEnabled: {
    label: "Animaciones activadas",
    description:
      "Activa las animaciones de transición e interfaz en toda la aplicación. Desactívela para mejorar el rendimiento en dispositivos más lentos",
  },
  connectionToServer: "Conexión al servidor",
  fontScale: {
    label: "Escala de fuente: {{value}}",
    description: "Ajusta el tamaño del texto utilizado en toda la aplicación",
  },
  keepScreenAwake: {
    label: "Mantener pantalla activa",
    description:
      "Evita que la pantalla se apague automáticamente mientras la aplicación está abierta",
  },
  fullScreen: {
    label: "Pantalla completa",
    description:
      "Oculta las barras de estado y navegación del sistema para usar toda la pantalla en la entrada de datos",
  },
  imageSizeLimit: {
    label: "Tamaño de imágenes limitado a: {{value}}MB",
    description:
      "Tamaño máximo al que se redimensionan las imágenes antes de guardarlas, a menos que la encuesta defina un límite menor para un atributo específico",
  },
  imageSizeUnlimited: {
    label: "Tamaño de imágenes ilimitado",
    description:
      "Las imágenes se almacenarán con la máxima resolución proporcionada por el dispositivo, a menos que se establezca un límite en el diseñador del formulario de encuesta.",
  },
  language: {
    label: "Idioma de la aplicación",
    description: "Establece el idioma utilizado en la interfaz de la aplicación",
  },
  locationAccuracyThreshold: {
    label: "Precisión de la ubicación (metros)",
    description:
      "Precisión mínima del GPS, en metros, requerida antes de aceptar una lectura de ubicación para un atributo de coordenadas",
  },
  locationAccuracyWatchTimeout: {
    label:
      "Tiempo de espera de la precisión de la ubicación: {{value}} segundos",
    description:
      "Tiempo máximo de espera de una lectura de ubicación que cumpla el umbral de precisión antes de desistir",
  },
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
  showRecordCompletion: {
    label: "Mostrar progreso de finalización del registro",
    description:
      "Muestra una barra de progreso con el porcentaje de campos obligatorios completados en el registro actual",
  },
  showStatusBar: {
    label: "Mostrar barra de estado",
    description:
      "Muestra el estado de la batería, el almacenamiento y la red mientras se edita un registro",
  },
  theme: {
    label: "Tema",
    description: "Establece el tema de color utilizado en la interfaz de la aplicación",
    auto: "Automático",
    dark: "Oscuro",
    dark2: "Oscuro 2",
    light: "Claro",
    light2: "Claro 2",
  },
};
