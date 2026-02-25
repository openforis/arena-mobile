export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Media access not allowed",
    message: `Access to media or media location not allowed; please open the application settings and allow permissions to access "Photos and Videos"
(select "Always allow all" if you don't want to show this confirm message anymore)`,
  },
  errorRequestingPermission: "Error requesting {{permission}}: {{details}}",
  permissionDenied: "Permission {{permission}} denied",
  permissionRequest: {
    title: "{{permission}} permission",
    message: "$t(common:appTitle) needs {{permission}} permission",
  },
  types: {
    accessMediaLocation: "Access to Media Location",
    camera: "Access to Camera",
    mediaLibrary: "Media Library",
    microphone: "Access to Microphone",
  },
};
