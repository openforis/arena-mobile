import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { useIsNetworkConnected } from "hooks";
import { SettingsService } from "service";
import { ExternalLoginProvider } from "service/externalLoginUtils";
import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  useAppDispatch,
} from "state";
import { AMConstants } from "utils";

import { isLoginDisabled, normalizeEmail } from "./remoteConnectionUtils";
import { PendingExternalLogin, useExternalLogin } from "./useExternalLogin";
import { useQrCodeLogin } from "./useQrCodeLogin";
import { useServerUrlForm } from "./useServerUrlForm";
import { useTwoFactorLogin } from "./useTwoFactorLogin";

export const useSettingsRemoteConnection = () => {
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const networkAvailable = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { email, password } = credentials;

  const serverUrlForm = useServerUrlForm();
  const { serverUrl, setStoredServerUrl } = serverUrlForm;

  const initialize = useCallback(
    () =>
      SettingsService.fetchSettings().then((settings) => {
        setStoredServerUrl(settings.serverUrl ?? AMConstants.defaultServerUrl);
        setCredentials({
          email: settings.email ?? "",
          password: settings.password ?? "",
        });
      }),
    [setStoredServerUrl],
  );

  // initialize form on load and reset form on logout
  useEffect(() => {
    initialize();
  }, [initialize, user]);

  const onEmailChange = useCallback(
    (text: string) =>
      setCredentials((credentialsPrev) => ({
        ...credentialsPrev,
        email: text,
      })),
    [],
  );

  const onPasswordChange = useCallback(
    (text: string) =>
      setCredentials((credentialsPrev) => ({
        ...credentialsPrev,
        password: text,
      })),
    [],
  );

  const {
    externalLoginProviders,
    loginWithExternalLoginCode,
    startExternalLogin,
  } = useExternalLogin({ serverUrl, networkAvailable, setLoading });
  // set while signing in with an external provider (read by the two-step verification)
  const pendingExternalLoginRef = useRef<PendingExternalLogin | null>(null);
  const [externalLoginProviderLabel, setExternalLoginProviderLabel] = useState<
    string | null
  >(null);

  // Arena account of the external sign-in, shown in the two-step verification
  const [externalLoginEmail, setExternalLoginEmail] = useState<string | null>(
    null,
  );

  const clearPendingExternalLogin = useCallback(() => {
    pendingExternalLoginRef.current = null;
    setExternalLoginProviderLabel(null);
    setExternalLoginEmail(null);
  }, []);

  const loginWithToken = useCallback(
    async (twoFactorToken?: string) => {
      const pendingExternalLogin = pendingExternalLoginRef.current;
      if (pendingExternalLogin) {
        const { code, codeVerifier } = pendingExternalLogin;
        const res = await loginWithExternalLoginCode({
          code,
          codeVerifier,
          twoFactorToken,
        });
        if (res.email) {
          setExternalLoginEmail(res.email);
        }
        // kept for the two-step verification
        if (res.user || (!twoFactorToken && !res.twoFactorRequired)) {
          clearPendingExternalLogin();
        }
        return res;
      }
      const emailNormalized = normalizeEmail(email);
      setCredentials((credentialsPrev) => ({
        ...credentialsPrev,
        email: emailNormalized,
      }));
      setLoading(true);
      return dispatch(
        RemoteConnectionActions.login({
          serverUrl,
          email: emailNormalized,
          password,
          twoFactorToken,
          navigator,
          showBack: true,
        }),
      );
    },
    [
      clearPendingExternalLogin,
      dispatch,
      email,
      loginWithExternalLoginCode,
      navigator,
      password,
      serverUrl,
    ],
  );

  const twoFactorLogin = useTwoFactorLogin({
    loading,
    setLoading,
    loginWithToken,
  });
  const { login, onTwoFactorGoBack: onTwoFactorGoBackInternal } =
    twoFactorLogin;

  const onLogin = useCallback(async () => {
    await login();
  }, [login]);

  const onExternalLogin = useCallback(
    async (provider: ExternalLoginProvider) => {
      const pendingExternalLogin = await startExternalLogin(provider);
      if (!pendingExternalLogin) return;
      pendingExternalLoginRef.current = pendingExternalLogin;
      setExternalLoginProviderLabel(pendingExternalLogin.providerLabel);
      await login();
    },
    [login, startExternalLogin],
  );

  const onTwoFactorGoBack = useCallback(() => {
    clearPendingExternalLogin();
    onTwoFactorGoBackInternal();
  }, [clearPendingExternalLogin, onTwoFactorGoBackInternal]);

  const qrCodeLogin = useQrCodeLogin({ setLoading });

  const onLogout = useCallback(() => {
    if (networkAvailable) {
      dispatch(RemoteConnectionActions.logout());
    } else {
      dispatch(RemoteConnectionActions.clearUserCredentials());
    }
  }, [dispatch, networkAvailable]);

  return {
    ...serverUrlForm,
    ...twoFactorLogin,
    ...qrCodeLogin,
    email,
    externalLoginEmail,
    externalLoginProviderLabel,
    externalLoginProviders,
    password,
    loading,
    loginDisabled: isLoginDisabled({ networkAvailable, email, password }),
    networkAvailable,
    user,
    onEmailChange,
    onPasswordChange,
    onExternalLogin,
    onLogin,
    onLogout,
    onTwoFactorGoBack,
  };
};
