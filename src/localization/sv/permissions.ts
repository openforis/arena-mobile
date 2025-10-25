export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Medieåtkomst ej tillåten",
    message:
      'Åtkomst till media eller medieplats ej tillåten; vänligen öppna applikationsinställningarna och tillåt behörighet för åtkomst till "Foton och videor"\n(välj "Tillåt alltid alla" om du inte vill visa detta bekräftelsemeddelande igen)',
  },
  errorRequestingPermission:
    "Fel vid begäran om behörighet {{permission}}: {{details}}",
  permissionDenied: "Behörighet {{permission}} nekad",
  permissionRequest: {
    title: "Behörighet {{permission}}",
    message: "$t(common:appTitle) behöver behörigheten {{permission}}",
  },
  types: {
    accessMediaLocation: "Åtkomst till medieplats",
    mediaLibrary: "Mediebibliotek",
  },
};
