export default {
  title: "Asetukset",
  animationsEnabled: {
    label: "Animaatiot käytössä",
    description:
      "Ottaa käyttöön siirtymä- ja käyttöliittymäanimaatiot koko sovelluksessa. Poista käytöstä parantaaksesi suorituskykyä hitaammilla laitteilla",
  },
  connectionToServer: "Yhteys palvelimeen",
  fontScale: {
    label: "Fonttikoko: {{value}}",
    description: "Säätää koko sovelluksessa käytettävän tekstin kokoa",
  },
  keepScreenAwake: {
    label: "Pidä näyttö hereillä",
    description:
      "Estää näyttöä sammumasta automaattisesti sovelluksen ollessa auki",
  },
  fullScreen: {
    label: "Koko näyttö",
    description:
      "Piilottaa järjestelmän tila- ja navigointipalkit, jotta koko näyttö voidaan käyttää tiedonkeruuseen",
  },
  imageSizeLimit: {
    label: "Kuvien koko rajoitettu: {{value}}MB",
    description:
      "Enimmäiskoko, johon kuvat pienennetään ennen tallennusta, ellei kysely määritä pienempää rajaa tietylle attribuutille",
  },
  imageSizeUnlimited: {
    label: "Kuvien koko rajoittamaton",
    description:
      "Kuvat tallennetaan laitteen tarjoamalla maksimiresoluutiolla, ellei kyselylomakkeen suunnittelijassa ole asetettu rajoitusta.",
  },
  language: {
    label: "Sovelluksen kieli",
    description: "Asettaa sovelluksen käyttöliittymässä käytettävän kielen",
  },
  locationAccuracyThreshold: {
    label: "Sijainnin tarkkuuden kynnysarvo (metriä)",
    description:
      "Vähimmäis-GPS-tarkkuus metreinä, joka vaaditaan ennen kuin sijaintilukema hyväksytään koordinaattiattribuutille",
  },
  locationAccuracyWatchTimeout: {
    label: "Sijainnin tarkkuuden seuranta-aika: {{value}} sekuntia",
    description:
      "Enimmäisaika, jonka sovellus odottaa tarkkuuden kynnysarvon täyttävää sijaintilukemaa ennen luovuttamista",
  },
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
  showRecordCompletion: {
    label: "Näytä tietueen täyttöaste",
    description:
      "Näyttää edistymispalkin, joka kertoo nykyisen tietueen pakollisten kenttien täyttöprosentin",
  },
  showStatusBar: {
    label: "Näytä tilarivi",
    description:
      "Näyttää akun, tallennustilan ja verkon tilan tietuetta muokattaessa",
  },
  theme: {
    label: "Teema",
    description: "Asettaa sovelluksen käyttöliittymässä käytettävän väriteeman",
    auto: "Automaattinen",
    dark: "Tumma",
    dark2: "Tumma 2",
    light: "Vaalea",
    light2: "Vaalea 2",
  },
};
