export default {
  title: "Asetukset",
  animationsEnabled: "Animaatiot käytössä",
  connectionToServer: "Yhteys palvelimeen",
  fontScale: "Fonttikoko: {{value}}",
  keepScreenAwake: "Pidä näyttö hereillä",
  fullScreen: "Koko näyttö",
  imageSizeLimit: "Kuvien koko rajoitettu: {{value}}MB",
  imageSizeUnlimited: {
    label: "Kuvien koko rajoittamaton",
    description:
      "Kuvat tallennetaan laitteen tarjoamalla maksimiresoluutiolla, ellei kyselylomakkeen suunnittelijassa ole asetettu rajoitusta.",
  },
  language: {
    label: "Sovelluksen kieli",
  },
  locationAccuracyThreshold: "Sijainnin tarkkuuden kynnysarvo (metriä)",
  locationAccuracyWatchTimeout:
    "Sijainnin tarkkuuden seuranta-aika: {{value}} sekuntia",
  locationAveragingEnabled: {
    label: "Sijainnin keskiarvoistus käytössä",
    description:
      "Kun tämä on käytössä, tallennettu sijainti on useiden sijaintilukemien keskiarvo, mikä parantaa tarkkuutta",
  },
  locationGpsLocked: {
    label: "GPS lukittu",
    description: `Varoitus: akun kulutus kasvaa!
GPS-signaali lukitaan, kun sovellus on käynnissä.
Se auttaa saamaan paremman tarkkuuden koordinaattiattribuuteissa.`,
    error:
      "GPS-lukitusta ei voi käynnistää: sijaintipalvelu ei ole käytettävissä tai sijaintiin ei ole myönnetty käyttöoikeutta",
  },
  gpsDevicePairing: {
    title: "Pariuta GPS-laite",
    scanButton: "Etsi laitteita",
    scanningLabel: "Etsitään lähellä olevia laitteita…",
    scanAgainButton: "Etsi uudelleen",
    emptyResult:
      "Laitteita ei löytynyt. Varmista, että GPS-vastaanottimesi on päällä ja pariutustilassa.",
    scanFailed: "Haussa tapahtui virhe. Yritä uudelleen.",
    recognizedDevicesNotice: "Vain GPS-vastaanottimiksi tunnistetut laitteet näytetään.",
    pairedDevicesTitle: "Pariutetut laitteet",
    newDevicesTitle: "Uudet laitteet",
    pairButton: "Pariuta",
    pairing: "Pariutetaan…",
    pairingSucceeded: "Pariutettu laitteen {{name}} kanssa",
    pairingFailed: "Pariutus laitteen {{name}} kanssa epäonnistui",
    bluetoothDisabled: "Bluetooth on pois päältä.",
    enableBluetoothButton: "Ota Bluetooth käyttöön",
    permissionDenied: "Laitteiden etsimiseen tarvitaan Bluetooth-lupa.",
    openSettingsButton: "Avaa sovelluksen asetukset",
  },
  preferredGpsSourceId: {
    label: "GPS-lähde",
    description:
      "Valitse, mitä GPS:ää käytetään koordinaattien tallentamiseen: puhelimen sisäistä GPS:ää vai pariutettua ulkoista GPS-vastaanotinta (esim. Bad Elf).",
    auto: "Automaattinen (ulkoinen, jos saatavilla)",
    internal: "Sisäinen GPS",
    pairNewDevice: "Pariuta uusi laite…",
  },
  showStatusBar: "Näytä tilarivi",
  theme: {
    label: "Teema",
    auto: "Automaattinen",
    dark: "Tumma",
    dark2: "Tumma 2",
    light: "Vaalea",
    light2: "Vaalea 2",
  },
};
