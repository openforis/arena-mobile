export default {
  error: {
    generic: "Error: {{details}}",
    invalidServerUrl: "Invalid Server URL",
    invalidCredentials: "Invalid Email or Password",
    invalidTwoFactorCode: "2FA code is incorrect. Please try again.",
    externalLogin: {
      generic: "Sign-in failed. Please try again.",
      ambiguousEmail:
        "More than one Arena account uses this email address: please contact the administrator.",
      emailDomainNotAllowed:
        "The email address of this account is not allowed for this sign-in method.",
      emailNotVerified: "The email address of this account is not verified.",
      flowInvalid: "The sign-in has expired. Please try again.",
      providerError:
        "The sign-in provider returned an error. Please try again.",
      providerNotAvailable: "This sign-in method is not available.",
      userNotFound:
        "No Arena user found for this account: sign in with your email and password, or ask the administrator for an invitation.",
    },
  },
  loginRequired: "Login required",
  loginSuccessful: "Login successful!",
  logout: "Logout",
  logoutConfirmMessage: "Are you sure you want to logout?",
  logoutOptions: {
    keepEmailAddress: "Keep email address",
  },
};
