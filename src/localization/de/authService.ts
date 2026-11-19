export default {
  error: {
    generic: "Fehler: {{details}}",
    invalidServerUrl: "Ungültige Server-URL",
    invalidCredentials: "Ungültige E-Mail oder Passwort",
    invalidTwoFactorCode: "2FA-Code ist falsch. Bitte versuchen Sie es erneut.",
    externalLogin: {
      generic: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      ambiguousEmail:
        "Mehrere Arena-Konten verwenden diese E-Mail-Adresse: Bitte wenden Sie sich an den Administrator.",
      emailDomainNotAllowed:
        "Die E-Mail-Adresse dieses Kontos ist für diese Anmeldemethode nicht zugelassen.",
      emailNotVerified: "Die E-Mail-Adresse dieses Kontos ist nicht bestätigt.",
      flowInvalid:
        "Die Anmeldung ist abgelaufen. Bitte versuchen Sie es erneut.",
      providerError:
        "Der Anmeldeanbieter hat einen Fehler gemeldet. Bitte versuchen Sie es erneut.",
      providerNotAvailable: "Diese Anmeldemethode ist nicht verfügbar.",
      userNotFound:
        "Kein Arena-Konto für dieses Konto gefunden: Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an oder bitten Sie den Administrator um eine Einladung.",
    },
  },
  loginRequired: "Anmeldung erforderlich",
  loginSuccessful: "Anmeldung erfolgreich!",
  logout: "Abmelden",
  logoutConfirmMessage: "Sind Sie sicher, dass Sie sich abmelden möchten?",
  logoutOptions: {
    keepEmailAddress: "E-Mail-Adresse behalten",
  },
};
