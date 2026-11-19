import { useCallback, useEffect, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { AuthService } from "service";
import { ExternalLoginProvider } from "service/externalLoginUtils";
import { MessageActions, RemoteConnectionActions, useAppDispatch } from "state";
import { Environment } from "utils/Environment";

// waits for the user to stop typing a custom server URL
const PROVIDERS_FETCH_DELAY_MS = 500;

export type PendingExternalLogin = {
  code: string;
  codeVerifier: string;
  providerLabel: string;
};

// sign-in with the external providers (Google, Microsoft, OpenID Connect) configured in the server
export const useExternalLogin = ({
  serverUrl,
  networkAvailable,
  setLoading,
}: {
  serverUrl: string;
  networkAvailable: boolean;
  setLoading: (loading: boolean) => void;
}) => {
  const dispatch = useAppDispatch();
  const navigator = useNavigator();
  const [providersFetched, setProvidersFetched] = useState<{
    serverUrl: string;
    providers: ExternalLoginProvider[];
  } | null>(null);

  // the browser cannot redirect to the web build of the app
  const enabled = networkAvailable && !Environment.isWeb && !!serverUrl;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const providers = await AuthService.fetchExternalLoginProviders({
        serverUrl,
      });
      if (!cancelled) setProvidersFetched({ serverUrl, providers });
    }, PROVIDERS_FETCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [enabled, serverUrl]);

  const externalLoginProviders =
    enabled && providersFetched?.serverUrl === serverUrl
      ? providersFetched.providers
      : [];

  // signs in at the provider; returns the code to exchange for the session tokens, if successful
  const startExternalLogin = useCallback(
    async (
      provider: ExternalLoginProvider,
    ): Promise<PendingExternalLogin | null> => {
      setLoading(true);
      const { code, codeVerifier, cancelled, error } =
        await AuthService.startExternalLogin({
          serverUrl,
          providerId: provider.id,
        });
      if (code && codeVerifier) {
        return { code, codeVerifier, providerLabel: provider.label };
      }
      setLoading(false);
      if (error && !cancelled) {
        dispatch(MessageActions.setMessage({ content: error }));
      }
      return null;
    },
    [dispatch, serverUrl, setLoading],
  );

  const loginWithExternalLoginCode = useCallback(
    ({
      code,
      codeVerifier,
      twoFactorToken,
    }: {
      code: string;
      codeVerifier: string;
      twoFactorToken?: string;
    }) => {
      setLoading(true);
      return dispatch(
        RemoteConnectionActions.loginWithExternalLoginCode({
          serverUrl,
          code,
          codeVerifier,
          twoFactorToken,
          navigator,
          showBack: true,
        }),
      );
    },
    [dispatch, navigator, serverUrl, setLoading],
  );

  return {
    externalLoginProviders,
    loginWithExternalLoginCode,
    startExternalLogin,
  };
};
