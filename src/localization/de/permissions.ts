export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Medienzugriff nicht erlaubt",
    message:
      'Zugriff auf Medien oder Medienstandort nicht erlaubt; bitte öffnen Sie die Anwendungseinstellungen und erlauben Sie die Berechtigung für den Zugriff auf "Fotos und Videos"\n(wählen Sie "Immer alle zulassen", wenn Sie diese Bestätigungsmeldung nicht mehr sehen möchten)',
  },
  errorRequestingPermission:
    "Fehler beim Anfordern der Berechtigung {{permission}}: {{details}}",
  permissionDenied: "Berechtigung {{permission}} verweigert",
  permissionRequest: {
    title: "Berechtigung {{permission}}",
    message: "$t(common:appTitle) benötigt die Berechtigung {{permission}}",
  },
  types: {
    accessMediaLocation: "Zugriff auf Medienstandort",
    mediaLibrary: "Medienbibliothek",
    camera: "Zugriff auf Kamera",
  },
};
