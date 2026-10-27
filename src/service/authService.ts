import { Dictionary, User } from "@openforis/arena-core";

import { API } from "./api";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";
import { log } from "utils/Logger";
import { SystemUtils } from "utils/SystemUtils";

const refreshTokenCookieName = "refreshToken";

const authTokenRefreshUrl = "/auth/token/refresh";

export const invalidServerUrlError = "authService:error.invalidServerUrl";
export const invalidCredentialsError = "authService:error.invalidCredentials";

const extractCookieValue = (
  headers: Dictionary<string>,
  cookieName: string,
): string | undefined => {
  const cookies = headers?.["set-cookie"];
  const cookie = cookies?.[0];
  if (!cookie) return undefined;
  // cookie string is in the format cookieName=cookieValue
  const endIndex = cookie.indexOf(";", cookieName.length + 1);
  return cookie.substring(
    cookieName.length + 1,
    endIndex > 0 ? endIndex : undefined,
  );
};

const extractAuthTokens = (response: any) => {
  const { data, headers } = response;
  const { authToken } = data;
  const refreshToken = extractCookieValue(headers, refreshTokenCookieName);
  return { authToken, refreshToken };
};

let _authToken: string | null = null;

const getAuthToken = (): string | null => _authToken;

const setAuthToken = (token: string | null) => {
  _authToken = token;
};

const generateAuthorizationHeaders = () =>
  _authToken ? { Authorization: `Bearer ${_authToken}` } : {};

const getServerUrl = async () =>
  (await SettingsService.fetchSettings()).serverUrl;

const extractErrorMessageFromLoginError = (err: any): { error: string } => {
  const { response } = err;
  if (!response) {
    return { error: invalidServerUrlError };
  }
  if (response.status === 401) {
    return { error: invalidCredentialsError };
  }
  return { error: err };
};

export type LoginResponse = {
  user?: User;
  error?: string;
  message?: string;
  twoFactorRequired?: boolean;
};

const onLoginSuccess = async ({
  data,
  response,
}: {
  data: any;
  response: any;
}): Promise<LoginResponse> => {
  const { authToken, refreshToken } = extractAuthTokens(response);
  if (authToken && refreshToken) {
    setAuthToken(authToken);
    await SecureStoreService.setAuthRefreshToken(refreshToken);
    return data;
  }
  return { error: invalidCredentialsError };
};

// kept in the device keychain to log in again silently when the refresh token expires (not with 2FA)
const storeCredentials = async ({
  serverUrl,
  email,
  password,
}: {
  serverUrl: string;
  email: string;
  password: string;
}) => {
  try {
    await SettingsService.setCredentials(serverUrl, email, password);
  } catch (error) {
    log.warn(`error storing credentials: ${error}`);
  }
};

const clearStoredCredentials = async (serverUrl?: string) => {
  try {
    await SettingsService.resetCredentials(serverUrl ?? (await getServerUrl()));
  } catch (error) {
    log.warn(`error clearing stored credentials: ${error}`);
  }
};

const login = async ({
  serverUrl: serverUrlParam,
  email,
  password,
  twoFactorToken,
}: {
  serverUrl?: string;
  email: string;
  password: string;
  twoFactorToken?: string;
}): Promise<LoginResponse> => {
  const serverUrl = serverUrlParam ?? (await getServerUrl());
  const appInfo = await SystemUtils.getApplicationInfo();
  try {
    const { data, response } = await API.post({
      serverUrl,
      uri: "/auth/login",
      data: {
        email,
        password,
        twoFactorToken,
        appInfo,
      },
    });
    const { twoFactorRequired } = data;
    if (twoFactorRequired) {
      return { twoFactorRequired };
    }
    const result = await onLoginSuccess({ data, response });
    if (result.user && !twoFactorToken) {
      await storeCredentials({ serverUrl, email, password });
    }
    return result;
  } catch (err: any) {
    return extractErrorMessageFromLoginError(err);
  }
};

const loginWithTempAuthToken = async ({
  serverUrl,
  token,
}: {
  serverUrl: string;
  token: string;
}): Promise<LoginResponse> => {
  try {
    const appInfo = await SystemUtils.getApplicationInfo();
    const { data, response } = await API.post({
      serverUrl,
      uri: "/auth/login/temp",
      data: { token, appInfo },
    });
    return onLoginSuccess({ data, response });
  } catch (err: any) {
    return extractErrorMessageFromLoginError(err);
  }
};

const logout = async () => {
  try {
    const { data } = await API.post({
      serverUrl: await getServerUrl(),
      uri: "/auth/logout",
    });
    return data;
  } catch (err: any) {
    if (!err.response) {
      return { error: invalidServerUrlError };
    }
    return { error: err };
  }
};

// the server answers 401 when the refresh token is invalid, expired or revoked
const isRefreshTokenRejected = (error: any): boolean =>
  error?.response?.status === 401;

// returns true if the user has been logged in again with the credentials stored in the keychain
const loginWithStoredCredentials = async (): Promise<boolean> => {
  const serverUrl = await getServerUrl();
  const credentials = await SettingsService.getCredentials(serverUrl);
  if (!credentials) return false;
  const { username: email, password } = credentials;
  const res = await login({ serverUrl, email, password });
  if (res.user) return true;
  // e.g. password changed or 2FA enabled: the user has to log in again
  if (res.twoFactorRequired || res.error === invalidCredentialsError) {
    await clearStoredCredentials(serverUrl);
  }
  return false;
};

const refreshAuthTokens = async () => {
  try {
    const serverUrl = await getServerUrl();
    const refreshTokenPrev = await SecureStoreService.getAuthRefreshToken();
    if (!refreshTokenPrev) {
      throw new Error("Error refreshing auth tokens; missing refresh token.");
    }
    const headers = { Cookie: `refreshToken=${refreshTokenPrev};` };
    const appInfo = await SystemUtils.getApplicationInfo();
    const { response } = await API.post({
      serverUrl,
      uri: authTokenRefreshUrl,
      data: { appInfo },
      config: { headers },
    });
    const { authToken, refreshToken } = extractAuthTokens(response);
    setAuthToken(authToken);
    await SecureStoreService.setAuthRefreshToken(refreshToken);
  } catch (error) {
    setAuthToken(null);
    // keep the refresh token on network or server errors (e.g. poor connection in the field):
    // it is still valid and the session can be refreshed later without a new login
    if (isRefreshTokenRejected(error)) {
      await SecureStoreService.setAuthRefreshToken(null);
      if (await loginWithStoredCredentials()) return;
    }
    throw error;
  }
};

export const AuthService = {
  authTokenRefreshUrl,
  clearStoredCredentials,
  getAuthToken,
  generateAuthorizationHeaders,
  login,
  loginWithTempAuthToken,
  logout,
  refreshAuthTokens,
};
