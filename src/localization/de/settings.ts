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
