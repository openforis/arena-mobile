export default {
  title: "Einstellungen",
  animationsEnabled: "Animationen aktiviert",
  connectionToServer: "Verbindung zum Server",
  fontScale: "Schriftgröße: {{value}}",
  keepScreenAwake: "Bildschirm wach halten",
  fullScreen: "Vollbild",
  imageSizeLimit: "Bildgröße beschränkt auf: {{value}}MB",
  imageSizeUnlimited: {
    label: "Bildgröße unbegrenzt",
    description:
      "Bilder werden in der maximalen Auflösung gespeichert, die vom Gerät bereitgestellt wird, es sei denn, im Umfrageformular-Designer ist ein Limit festgelegt.",
  },
  language: {
    label: "Sprache der Anwendung",
  },
  locationAccuracyThreshold:
    "Schwellenwert für die Standortgenauigkeit (Meter)",
  locationAccuracyWatchTimeout:
    "Timeout für die Überwachung der Standortgenauigkeit: {{value}} Sekunden",
  locationAveragingEnabled: {
    label: "Standortmittelung aktiviert",
    description:
      "Wenn aktiviert, ist der aufgezeichnete Standort der Durchschnitt mehrerer Standortmessungen, was die Genauigkeit verbessert",
  },
  locationGpsLocked: {
    label: "GPS gesperrt",
    description: `Warnung: Der Batterieverbrauch wird steigen!
  Das GPS-Signal wird gesperrt, wenn die Anwendung läuft.
  Dies hilft, eine bessere Genauigkeit bei Koordinatenattributen zu erzielen.`,
    error:
      "GPS-Sperrung kann nicht gestartet werden: Standortanbieter nicht verfügbar oder Zugriff auf den Standort nicht gewährt",
  },
  gpsDevicePairing: {
    title: "GPS-Gerät koppeln",
    scanButton: "Nach Geräten suchen",
    scanningLabel: "Suche nach Geräten in der Nähe…",
    scanAgainButton: "Erneut suchen",
    emptyResult:
      "Keine Geräte gefunden. Stellen Sie sicher, dass Ihr GPS-Empfänger eingeschaltet und im Kopplungsmodus ist.",
    scanFailed: "Bei der Suche ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    recognizedDevicesNotice:
      "Es werden nur Geräte angezeigt, die als GPS-Empfänger erkannt wurden.",
    pairButton: "Koppeln",
    pairing: "Wird gekoppelt…",
    pairingSucceeded: "Mit {{name}} gekoppelt",
    pairingFailed: "Koppeln mit {{name}} fehlgeschlagen",
    bluetoothDisabled: "Bluetooth ist ausgeschaltet.",
    enableBluetoothButton: "Bluetooth aktivieren",
    permissionDenied:
      "Für die Gerätesuche ist die Bluetooth-Berechtigung erforderlich.",
    openSettingsButton: "App-Einstellungen öffnen",
  },
  preferredGpsSourceId: {
    label: "GPS-Quelle",
    description:
      "Wählen Sie, welches GPS zur Aufzeichnung von Koordinaten verwendet wird: das interne GPS des Telefons oder ein gekoppelter externer GPS-Empfänger (z. B. Bad Elf).",
    auto: "Automatisch (extern, falls verfügbar)",
    internal: "Internes GPS",
    pairNewDevice: "Neues Gerät koppeln…",
  },

  showStatusBar: "Statusleiste anzeigen",
  theme: {
    label: "Design",
    auto: "Automatisch",
    dark: "Dunkel",
    dark2: "Dunkel 2",
    light: "Hell",
    light2: "Hell 2",
  },
};
