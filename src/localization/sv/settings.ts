export default {
  title: "Inställningar",
  animationsEnabled: "Animationer aktiverade",
  connectionToServer: "Anslutning till servern",
  fontScale: "Fontskala: {{value}}",
  keepScreenAwake: "Håll skärmen vaken",
  fullScreen: "Helskärm",
  imageSizeLimit: "Bildstorlek begränsad till: {{value}}MB",
  imageSizeUnlimited: {
    label: "Bildstorlek obegränsad",
    description:
      "Bilder kommer att lagras i den maximala upplösningen som tillhandahålls av enheten, såvida inte en gräns är inställd i enkätformulärsdesignern.",
  },
  language: {
    label: "Applikationsspråk",
  },
  locationAccuracyThreshold: "Tröskelvärde för platsnoggrannhet (meter)",
  locationAccuracyWatchTimeout:
    "Timeout för övervakning av platsnoggrannhet: {{value}} sekunder",
  locationAveragingEnabled: {
    label: "Platsgenomsnitt aktiverat",
    description:
      "När aktiverat kommer den inspelade platsen att vara genomsnittet av flera platsavläsningar, vilket förbättrar noggrannheten",
  },
  locationGpsLocked: {
    label: "GPS låst",
    description: `Varning: batteriförbrukningen kommer att öka!
GPS-signalen kommer att låsas när applikationen körs.
Det kommer att hjälpa till att få bättre noggrannhet i en koordinatattribut.`,
    error:
      "Kan inte starta GPS-låsning: platsleverantören är inte tillgänglig eller åtkomst till platsen inte beviljad",
  },
  gpsDevicePairing: {
    title: "Parkoppla en GPS-enhet",
    scanButton: "Sök efter enheter",
    scanningLabel: "Söker efter enheter i närheten…",
    scanAgainButton: "Sök igen",
    emptyResult:
      "Inga enheter hittades. Se till att din GPS-mottagare är påslagen och i parkopplingsläge.",
    scanFailed: "Något gick fel under sökningen. Försök igen.",
    showAllDevices: "Visa alla enheter i närheten",
    pairButton: "Parkoppla",
    pairing: "Parkopplar…",
    pairingSucceeded: "Parkopplad med {{name}}",
    pairingFailed: "Det gick inte att parkoppla med {{name}}",
    bluetoothDisabled: "Bluetooth är avstängt.",
    enableBluetoothButton: "Aktivera Bluetooth",
    permissionDenied: "Bluetooth-behörighet krävs för att söka efter enheter.",
    openSettingsButton: "Öppna appinställningar",
  },
  preferredGpsSourceId: {
    label: "GPS-källa",
    description:
      "Välj vilken GPS som används för att registrera koordinater: telefonens interna GPS eller en parkopplad extern GPS-mottagare (t.ex. Bad Elf).",
    auto: "Auto (extern om tillgänglig)",
    internal: "Intern GPS",
    pairNewDevice: "Parkoppla en ny enhet…",
  },
  showStatusBar: "Visa statusfältet",
  theme: {
    label: "Tema",
    auto: "Auto",
    dark: "Mörk",
    dark2: "Mörk 2",
    light: "Ljus",
    light2: "Ljus 2",
  },
};
