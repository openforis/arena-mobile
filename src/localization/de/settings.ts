export default {
  title: "Einstellungen",
  group: {
    appearance: "Erscheinungsbild",
    dataEntry: "Dateneingabe",
    location: "Standort & GPS",
    images: "Bilder",
  },
  animationsEnabled: {
    label: "Animationen aktiviert",
    description:
      "Aktiviert Übergangs- und Oberflächenanimationen in der gesamten App. Deaktivieren, um die Leistung auf langsameren Geräten zu verbessern",
  },
  connectionToServer: "Verbindung zum Server",
  fontScale: {
    label: "Schriftgröße: {{value}}",
    description: "Passt die in der gesamten App verwendete Textgröße an",
  },
  keepScreenAwake: {
    label: "Bildschirm wach halten",
    description:
      "Verhindert, dass sich der Bildschirm automatisch ausschaltet, während die App geöffnet ist",
  },
  fullScreen: {
    label: "Vollbild",
    description:
      "Blendet die System-Status- und Navigationsleisten aus, um den vollen Bildschirm für die Dateneingabe zu nutzen",
  },
  imageSizeLimit: {
    label: "Bildgröße beschränkt auf: {{value}}MB",
    description:
      "Maximale Größe, auf die Bilder vor dem Speichern verkleinert werden, sofern die Umfrage kein kleineres Limit für ein bestimmtes Attribut festlegt",
  },
  imageSizeUnlimited: {
    label: "Bildgröße unbegrenzt",
    description:
      "Bilder werden in der maximalen Auflösung gespeichert, die vom Gerät bereitgestellt wird, es sei denn, im Umfrageformular-Designer ist ein Limit festgelegt.",
  },
  language: {
    label: "Sprache der Anwendung",
    description: "Legt die in der App-Oberfläche verwendete Sprache fest",
  },
  locationAccuracyThreshold: {
    label: "Schwellenwert für die Standortgenauigkeit (Meter)",
    description:
      "Mindest-GPS-Genauigkeit in Metern, die erforderlich ist, bevor eine Standortmessung für ein Koordinatenattribut akzeptiert wird",
  },
  locationAccuracyWatchTimeout: {
    label:
      "Timeout für die Überwachung der Standortgenauigkeit: {{value}} Sekunden",
    description:
      "Maximale Wartezeit auf eine Standortmessung, die den Genauigkeitsschwellenwert erfüllt, bevor abgebrochen wird",
  },
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
    pairedDevicesTitle: "Gekoppelte Geräte",
    newDevicesTitle: "Neue Geräte",
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

  showRecordCompletion: {
    label: "Fortschritt der Datensatzvervollständigung anzeigen",
    description:
      "Zeigt einen Fortschrittsbalken mit dem Prozentsatz der erfüllten Anforderungen des aktuellen Datensatzes an",
  },
  showStatusBar: {
    label: "Statusleiste anzeigen",
    description:
      "Zeigt Akku-, Speicher- und Netzwerkstatus während der Bearbeitung eines Datensatzes an",
  },
  theme: {
    label: "Design",
    description: "Legt das in der App-Oberfläche verwendete Farbdesign fest",
    auto: "Automatisch",
    dark: "Dunkel",
    dark2: "Dunkel 2",
    light: "Hell",
    light2: "Hell 2",
  },
};
