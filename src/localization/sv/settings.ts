export default {
  title: "Inställningar",
  animationsEnabled: {
    label: "Animationer aktiverade",
    description:
      "Aktiverar övergångs- och gränssnittsanimationer i hela appen. Inaktivera för att förbättra prestandan på långsammare enheter",
  },
  connectionToServer: "Anslutning till servern",
  fontScale: {
    label: "Fontskala: {{value}}",
    description: "Justerar storleken på texten som används i hela appen",
  },
  keepScreenAwake: {
    label: "Håll skärmen vaken",
    description:
      "Förhindrar att skärmen stängs av automatiskt medan appen är öppen",
  },
  fullScreen: {
    label: "Helskärm",
    description:
      "Döljer systemets status- och navigeringsfält för att använda hela skärmen vid datainmatning",
  },
  imageSizeLimit: {
    label: "Bildstorlek begränsad till: {{value}}MB",
    description:
      "Maximal storlek som bilder skalas ner till innan de sparas, såvida inte enkäten anger en mindre gräns för ett specifikt attribut",
  },
  imageSizeUnlimited: {
    label: "Bildstorlek obegränsad",
    description:
      "Bilder kommer att lagras i den maximala upplösningen som tillhandahålls av enheten, såvida inte en gräns är inställd i enkätformulärsdesignern.",
  },
  language: {
    label: "Applikationsspråk",
    description: "Anger det språk som används i appens gränssnitt",
  },
  locationAccuracyThreshold: {
    label: "Tröskelvärde för platsnoggrannhet (meter)",
    description:
      "Minsta GPS-noggrannhet, i meter, som krävs innan en platsavläsning accepteras för ett koordinatattribut",
  },
  locationAccuracyWatchTimeout: {
    label:
      "Timeout för övervakning av platsnoggrannhet: {{value}} sekunder",
    description:
      "Maximal tid att vänta på en platsavläsning som uppfyller noggrannhetströskeln innan det ges upp",
  },
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
    recognizedDevicesNotice: "Endast enheter som identifierats som GPS-mottagare visas.",
    pairedDevicesTitle: "Parkopplade enheter",
    newDevicesTitle: "Nya enheter",
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
  showRecordCompletion: {
    label: "Visa postens ifyllnadsgrad",
    description:
      "Visar en förloppsindikator med andelen obligatoriska fält som fyllts i för den aktuella posten",
  },
  showStatusBar: {
    label: "Visa statusfältet",
    description:
      "Visar batteri-, lagrings- och nätverksstatus medan en post redigeras",
  },
  theme: {
    label: "Tema",
    description: "Anger färgtemat som används i appens gränssnitt",
    auto: "Auto",
    dark: "Mörk",
    dark2: "Mörk 2",
    light: "Ljus",
    light2: "Ljus 2",
  },
};
