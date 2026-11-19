export default {
  error: {
    generic: "Error: {{details}}",
    invalidServerUrl: "URL del servidor no válida",
    invalidCredentials: "Correo electrónico o contraseña no válidos",
    invalidTwoFactorCode:
      "El código 2FA es incorrecto. Por favor, inténtelo de nuevo.",
    externalLogin: {
      generic: "No se pudo iniciar sesión. Por favor, inténtelo de nuevo.",
      ambiguousEmail:
        "Más de una cuenta de Arena usa esta dirección de correo: por favor, contacte al administrador.",
      emailDomainNotAllowed:
        "La dirección de correo de esta cuenta no está permitida para este método de inicio de sesión.",
      emailNotVerified:
        "La dirección de correo de esta cuenta no está verificada.",
      flowInvalid:
        "El inicio de sesión ha caducado. Por favor, inténtelo de nuevo.",
      providerError:
        "El proveedor de inicio de sesión devolvió un error. Por favor, inténtelo de nuevo.",
      providerNotAvailable:
        "Este método de inicio de sesión no está disponible.",
      userNotFound:
        "No se encontró ninguna cuenta de Arena para esta cuenta: inicie sesión con su correo y contraseña, o pida una invitación al administrador.",
    },
  },
  loginRequired: "Inicio de sesión requerido",
  loginSuccessful: "¡Inicio de sesión completado!",
  logout: "Cerrar sesión",
  logoutConfirmMessage: "¿Está seguro de que desea cerrar sesión?",
  logoutOptions: {
    keepEmailAddress: "Mantener dirección de correo electrónico",
  },
};
