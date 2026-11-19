export default {
  error: {
    generic: "Erreur: {{details}}",
    invalidServerUrl: "URL du serveur invalide",
    invalidCredentials: "Adresse e-mail ou mot de passe incorrect",
    invalidTwoFactorCode: "Le code 2FA est incorrect. Veuillez réessayer.",
    externalLogin: {
      generic: "La connexion a échoué. Veuillez réessayer.",
      ambiguousEmail:
        "Plusieurs comptes Arena utilisent cette adresse e-mail : veuillez contacter l'administrateur.",
      emailDomainNotAllowed:
        "L'adresse e-mail de ce compte n'est pas autorisée pour cette méthode de connexion.",
      emailNotVerified: "L'adresse e-mail de ce compte n'est pas vérifiée.",
      flowInvalid: "La connexion a expiré. Veuillez réessayer.",
      providerError:
        "Le fournisseur de connexion a renvoyé une erreur. Veuillez réessayer.",
      providerNotAvailable: "Cette méthode de connexion n'est pas disponible.",
      userNotFound:
        "Aucun compte Arena trouvé pour ce compte : connectez-vous avec votre e-mail et votre mot de passe, ou demandez une invitation à l'administrateur.",
    },
  },
  loginRequired: "Connexion requise",
  loginSuccessful: "Connexion réussie!",
  logout: "Déconnexion",
  logoutConfirmMessage: "Êtes-vous sûr de vouloir vous déconnecter?",
  logoutOptions: {
    keepEmailAddress: "Conserver l'adresse e-mail",
  },
};
