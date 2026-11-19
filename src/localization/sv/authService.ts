export default {
  error: {
    generic: "Fel: {{details}}",
    invalidServerUrl: "Ogiltig server-URL",
    invalidCredentials: "Ogiltig e-postadress eller lösenord",
    invalidTwoFactorCode: "2FA-koden är felaktig. Vänligen försök igen.",
    externalLogin: {
      generic: "Inloggningen misslyckades. Försök igen.",
      ambiguousEmail:
        "Fler än ett Arena-konto använder den här e-postadressen: kontakta administratören.",
      emailDomainNotAllowed:
        "E-postadressen för det här kontot är inte tillåten för den här inloggningsmetoden.",
      emailNotVerified: "E-postadressen för det här kontot är inte verifierad.",
      flowInvalid: "Inloggningen har gått ut. Försök igen.",
      providerError:
        "Inloggningsleverantören returnerade ett fel. Försök igen.",
      providerNotAvailable: "Den här inloggningsmetoden är inte tillgänglig.",
      userNotFound:
        "Inget Arena-konto hittades för det här kontot: logga in med din e-postadress och ditt lösenord, eller be administratören om en inbjudan.",
    },
  },
  loginRequired: "Inloggning krävs",
  loginSuccessful: "Inloggning lyckades!",
  logout: "Logga ut",
  logoutConfirmMessage: "Är du säker på att du vill logga ut?",
  logoutOptions: {
    keepEmailAddress: "Behåll e-postadress",
  },
};
