export default {
  battery: {
    title: "Akku",
    level: "Akkustand",
    statusLabel: "Akkustatus",
    status: {
      charging: "Wird geladen",
      unplugged: "Nicht angeschlossen",
    },
    timeLeftToDischarge: "Verbleibende Zeit bis zur Entladung",
    timeLeftToFullCharge: "Verbleibende Zeit bis zur vollständigen Ladung",
  },
  internalMemory: {
    title: "Interner Speicher",
    storageAvailable: "Verfügbarer Speicher",
    recordFilesSize: "Größe der Datensatzdateien",
    tempFilesSize: "Größe der temporären Dateien",
  },
  locationServiceDisabled: {
    warning:
      "Standortdienst deaktiviert; bitte aktivieren Sie ihn in den Geräteeinstellungen.",
  },
  externalGps: {
    unavailable: {
      warning:
        "Externes GPS-Gerät nicht verfügbar; für diese Sitzung wird das interne GPS verwendet.",
    },
  },
  network: {
    title: "Netzwerk",
    statusLabel: "Netzwerkstatus",
    status: {
      connected: "Verbunden",
      offline: "Offline",
    },
  },
};
