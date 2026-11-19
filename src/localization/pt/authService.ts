export default {
  error: {
    generic: "Erro: {{details}}",
    invalidServerUrl: "URL do servidor inválido",
    invalidCredentials: "Email ou senha inválidos",
    invalidTwoFactorCode:
      "O código 2FA está incorreto. Por favor, tente novamente.",
    externalLogin: {
      generic: "Falha ao entrar. Por favor, tente novamente.",
      ambiguousEmail:
        "Mais de uma conta do Arena usa este endereço de e-mail: por favor, contate o administrador.",
      emailDomainNotAllowed:
        "O endereço de e-mail desta conta não é permitido para este método de login.",
      emailNotVerified: "O endereço de e-mail desta conta não foi verificado.",
      flowInvalid: "O login expirou. Por favor, tente novamente.",
      providerError:
        "O provedor de login retornou um erro. Por favor, tente novamente.",
      providerNotAvailable: "Este método de login não está disponível.",
      userNotFound:
        "Nenhuma conta do Arena encontrada para esta conta: entre com seu e-mail e senha, ou peça um convite ao administrador.",
    },
  },
  loginRequired: "Login obrigatório",
  loginSuccessful: "Login efetuado com sucesso!",
  logout: "Sair",
  logoutConfirmMessage: "Tem certeza que deseja sair?",
  logoutOptions: {
    keepEmailAddress: "Manter endereço de email",
  },
};
