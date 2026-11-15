import { useCallback, useEffect, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { useIsNetworkConnected } from "hooks";
import { SettingsService } from "service";
import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
  useAppDispatch,
} from "state";
import { AMConstants } from "utils";

import { isLoginDisabled, normalizeEmail } from "./remoteConnectionUtils";
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

  const loginWithToken = useCallback(
    (twoFactorToken?: string) => {
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
    [dispatch, email, navigator, password, serverUrl],
  );

  const twoFactorLogin = useTwoFactorLogin({
    loading,
    setLoading,
    loginWithToken,
  });
  const { login } = twoFactorLogin;

  const onLogin = useCallback(() => login(), [login]);

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
    password,
    loading,
    loginDisabled: isLoginDisabled({ networkAvailable, email, password }),
    networkAvailable,
    user,
    onEmailChange,
    onPasswordChange,
    onLogin,
    onLogout,
  };
};
