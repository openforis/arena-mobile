export default {
  error: {
    generic: "Greška: {{details}}",
    invalidServerUrl: "Neispravan URL servera",
    invalidCredentials: "Neispravan e-mail ili lozinka",
    invalidTwoFactorCode: "2FA kod nije ispravan. Molimo pokušajte ponovo.",
    externalLogin: {
      generic: "Prijava nije uspjela. Molimo pokušajte ponovo.",
      ambiguousEmail:
        "Više Arena naloga koristi ovu e-mail adresu: molimo kontaktirajte administratora.",
      emailDomainNotAllowed:
        "E-mail adresa ovog naloga nije dozvoljena za ovaj način prijave.",
      emailNotVerified: "E-mail adresa ovog naloga nije potvrđena.",
      flowInvalid: "Prijava je istekla. Molimo pokušajte ponovo.",
      providerError:
        "Provajder prijave je vratio grešku. Molimo pokušajte ponovo.",
      providerNotAvailable: "Ovaj način prijave nije dostupan.",
      userNotFound:
        "Nije pronađen Arena nalog za ovaj nalog: prijavite se e-mailom i lozinkom ili zatražite pozivnicu od administratora.",
    },
  },
  loginRequired: "Potrebna je prijava",
  loginSuccessful: "Prijava uspješna!",
  logout: "Odjavi se",
  logoutConfirmMessage: "Da li ste sigurni da želite da se odjavite?",
  logoutOptions: {
    keepEmailAddress: "Zadrži e-mail adresu",
  },
};
