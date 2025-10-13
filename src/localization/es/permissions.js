export default {
  confirmOpenSettingsAccessMediaLocationNotAllowed: {
    title: "Acceso a medios no permitido",
    message:
      'Acceso a medios o a la ubicación de medios no permitido; por favor, abra la configuración de la aplicación y autorice los permisos para acceder a "Fotos y Videos"\n(seleccione "Permitir siempre todos" si no desea que se muestre este mensaje de confirmación de nuevo)',
  },
  errorRequestingPermission:
    "Error al solicitar el permiso {{permission}}: {{details}}",
  permissionDenied: "Permiso {{permission}} denegado",
  permissionRequest: {
    title: "Permiso {{permission}}",
    message: "$t(common:appTitle) necesita el permiso {{permission}}",
  },
  types: {
    accessMediaLocation: "Acceso a la Ubicación de Medios",
    mediaLibrary: "Biblioteca de Medios",
  },
};
