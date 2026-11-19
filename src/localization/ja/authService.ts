export default {
  error: {
    generic: "エラー：{{details}}",
    invalidServerUrl: "サーバーURLが無効です",
    invalidCredentials: "メールアドレスまたはパスワードが無効です",
    invalidTwoFactorCode:
      "2FA（二要素認証）コードが正しくありません。もう一度お試しください。",
    externalLogin: {
      generic: "サインインに失敗しました。もう一度お試しください。",
      ambiguousEmail:
        "このメールアドレスは複数の Arena アカウントで使用されています。管理者にお問い合わせください。",
      emailDomainNotAllowed:
        "このアカウントのメールアドレスは、このサインイン方法では許可されていません。",
      emailNotVerified: "このアカウントのメールアドレスは確認されていません。",
      flowInvalid: "サインインの有効期限が切れました。もう一度お試しください。",
      providerError:
        "サインインプロバイダーがエラーを返しました。もう一度お試しください。",
      providerNotAvailable: "このサインイン方法は利用できません。",
      userNotFound:
        "このアカウントに対応する Arena アカウントが見つかりません。メールアドレスとパスワードでサインインするか、管理者に招待を依頼してください。",
    },
  },
  loginRequired: "ログインが必要です",
  loginSuccessful: "ログインに成功しました！",
  logout: "ログアウト",
  logoutConfirmMessage: "ログアウトしてもよいですか？",
  logoutOptions: {
    keepEmailAddress: "メールアドレスを保持",
  },
};
