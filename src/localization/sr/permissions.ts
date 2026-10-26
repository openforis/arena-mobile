export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Pristup medijima nije dozvoljen",
    message: `Pristup medijima ili lokaciji medija nije dozvoljen; otvorite podešavanja aplikacije i dozvolite pristup stavci "Fotografije i video zapisi"
(izaberite "Uvijek dozvoli sve" ako ne želite da se ova poruka više prikazuje)`,
  },
  errorRequestingPermission:
    "Greška pri traženju dozvole {{permission}}: {{details}}",
  permissionDenied: "Dozvola {{permission}} je odbijena",
  permissionRequest: {
    title: "Dozvola: {{permission}}",
    message:
      "Aplikaciji $t(common:appTitle) je potrebna dozvola: {{permission}}",
  },
  types: {
    accessMediaLocation: "Pristup lokaciji medija",
    bluetoothConnect: "Bluetooth povezivanje",
    bluetoothScan: "Bluetooth skeniranje",
    camera: "Pristup kameri",
    mediaLibrary: "Biblioteka medija",
    microphone: "Pristup mikrofonu",
  },
};
