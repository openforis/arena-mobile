export default {
  error: {
    generic: "Virhe: {{details}}",
    invalidServerUrl: "Virheellinen palvelimen URL-osoite",
    invalidCredentials: "Virheellinen sähköposti tai salasana",
    invalidTwoFactorCode: "2FA-koodi on virheellinen. Yritä uudelleen.",
    externalLogin: {
      generic: "Kirjautuminen epäonnistui. Yritä uudelleen.",
      ambiguousEmail:
        "Useampi Arena-tili käyttää tätä sähköpostiosoitetta: ota yhteyttä ylläpitäjään.",
      emailDomainNotAllowed:
        "Tämän tilin sähköpostiosoite ei ole sallittu tälle kirjautumistavalle.",
      emailNotVerified: "Tämän tilin sähköpostiosoitetta ei ole vahvistettu.",
      flowInvalid: "Kirjautuminen on vanhentunut. Yritä uudelleen.",
      providerError: "Kirjautumispalvelu palautti virheen. Yritä uudelleen.",
      providerNotAvailable: "Tämä kirjautumistapa ei ole käytettävissä.",
      userNotFound:
        "Tälle tilille ei löytynyt Arena-tiliä: kirjaudu sähköpostiosoitteella ja salasanalla tai pyydä kutsu ylläpitäjältä.",
    },
  },
  loginRequired: "Kirjautuminen vaaditaan",
  loginSuccessful: "Kirjautuminen onnistui!",
  logout: "Kirjaudu ulos",
  logoutConfirmMessage: "Oletko varma, että haluat kirjautua ulos?",
  logoutOptions: {
    keepEmailAddress: "Tallenna sähköpostiosoite",
  },
};
