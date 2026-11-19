import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";

import { Dictionary, User } from "@openforis/arena-core";

import { API } from "./api";
import { APIUtils } from "./api/apiUtils";
import {
  base64ToBase64Url,
  bytesToBase64Url,
  ExternalLoginProvider,
  externalLoginRedirectUri,
  extractUrlQueryParams,
  filterMobileLoginProviders,
  getExternalLoginStartUri,
} from "./externalLoginUtils";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";
import { HttpErrors } from "utils/HttpErrors";
import { log } from "utils/Logger";
import { SystemUtils } from "utils/SystemUtils";

const refreshTokenCookieName = "refreshToken";

const authTokenRefreshUrl = "/auth/token/refresh";

export const invalidServerUrlError = "authService:error.invalidServerUrl";
export const invalidCredentialsError = "authService:error.invalidCredentials";
export const invalidTwoFactorCodeError =
  "authService:error.invalidTwoFactorCode";

// error keys sent by the server (externalLogin.*) with a translation in authService:error.externalLogin
const externalLoginErrorKeys = new Set([
  "ambiguousEmail",
  "emailDomainNotAllowed",
  "emailNotVerified",
  "flowInvalid",
  "providerError",
  "providerNotAvailable",
  "userNotFound",
]);
const externalLoginServerErrorKeyPrefix = "externalLogin.";

const extractCookieValue = (
  headers: Dictionary<string>,
  cookieName: string,
): string | undefined => {
  const cookies: string[] = [headers?.["set-cookie"] ?? []].flat();
  const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
  if (!cookie) return undefined;
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
  if (HttpErrors.isUnauthorizedResponse(err)) {
    return { error: invalidCredentialsError };
  }
  return { error: err.message };
};

export type LoginResponse = {
  user?: User;
  error?: string;
  message?: string;
  twoFactorRequired?: boolean;
  // email of the Arena account asking for the 2FA code (external login, not sent by older servers)
  email?: string;
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
    await SecureStoreService.setServerCredentials(serverUrl, email, password);
  } catch (error) {
    log.warn(`error storing credentials: ${error}`);
  }
};

const clearStoredCredentials = async (serverUrl?: string) => {
  try {
    await SecureStoreService.resetServerCredentials(
      serverUrl ?? (await getServerUrl()),
    );
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
    // the 2FA code is sent only after the password has been accepted
    if (twoFactorToken && HttpErrors.isUnauthorizedResponse(err)) {
      return { error: invalidTwoFactorCodeError };
    }
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

// ===== external providers (Google, Microsoft, OpenID Connect)

const fetchExternalLoginProviders = async ({
  serverUrl,
}: {
  serverUrl: string;
}): Promise<ExternalLoginProvider[]> => {
  try {
    const { data } = await API.get({ serverUrl, uri: "/auth/providers" });
    return filterMobileLoginProviders(data);
  } catch (error) {
    // not available in servers released before the external login providers
    log.debug(`external login providers not available: ${String(error)}`);
    return [];
  }
};

const toExternalLoginError = (serverErrorKey?: unknown): string => {
  const key =
    typeof serverErrorKey === "string" &&
    serverErrorKey.startsWith(externalLoginServerErrorKeyPrefix)
      ? serverErrorKey.substring(externalLoginServerErrorKeyPrefix.length)
      : null;
  const knownKey = key && externalLoginErrorKeys.has(key) ? key : "generic";
  return `authService:error.externalLogin.${knownKey}`;
};

export type ExternalLoginStartResult = {
  // to be exchanged for the session tokens with loginWithExternalLoginCode
  code?: string;
  codeVerifier?: string;
  cancelled?: boolean;
  error?: string;
};

// PKCE: the code received on the app redirect URI can be exchanged only with this verifier
const generateCodeVerifier = (): string =>
  bytesToBase64Url(Crypto.getRandomBytes(32));

const toCodeChallenge = async (codeVerifier: string): Promise<string> =>
  base64ToBase64Url(
    await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 },
    ),
  );

// signs in at the provider in the system browser, which then redirects to the app
const startExternalLogin = async ({
  serverUrl,
  providerId,
}: {
  serverUrl: string;
  providerId: string;
}): Promise<ExternalLoginStartResult> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await toCodeChallenge(codeVerifier);
  const url = APIUtils.getUrl({
    serverUrl,
    uri: getExternalLoginStartUri({ providerId, codeChallenge }),
  });
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      externalLoginRedirectUri,
    );
    if (result.type !== "success") {
      return { cancelled: true };
    }
    const { code, externalLoginError } = extractUrlQueryParams(result.url);
    if (code) {
      return { code, codeVerifier };
    }
    return { error: toExternalLoginError(externalLoginError) };
  } catch (error) {
    log.error(`error opening external login: ${String(error)}`);
    return { error: toExternalLoginError() };
  }
};

const loginWithExternalLoginCode = async ({
  serverUrl,
  code,
  codeVerifier,
  twoFactorToken,
}: {
  serverUrl: string;
  code: string;
  codeVerifier: string;
  twoFactorToken?: string;
}): Promise<LoginResponse> => {
  try {
    const appInfo = await SystemUtils.getApplicationInfo();
    const { data, response } = await API.post({
      serverUrl,
      uri: "/auth/oidc/_mobile-token",
      data: { code, codeVerifier, twoFactorToken, appInfo },
    });
    if (data?.twoFactorRequired) {
      const email = typeof data.email === "string" ? data.email : undefined;
      return { twoFactorRequired: true, email };
    }
    const result = await onLoginSuccess({ data, response });
    if (result.user) {
      // credentials of a previous password login would silently log in another user when the session expires
      await clearStoredCredentials(serverUrl);
    }
    return result;
  } catch (err: any) {
    if (HttpErrors.isUnauthorizedResponse(err)) {
      const message = err.response?.data?.message;
      if (twoFactorToken && message === "externalLogin.invalidTwoFactorCode") {
        return { error: invalidTwoFactorCodeError };
      }
      return { error: toExternalLoginError(message) };
    }
    return extractErrorMessageFromLoginError(err);
  }
};

const logout = async () => {
  try {
    const { data } = await API.post({
      serverUrl: await getServerUrl(),
      uri: "/auth/logout",
      // the server requires a valid access token for the logout
      config: { headers: generateAuthorizationHeaders() },
    });
    return data;
  } catch (err: any) {
    if (!err.response) {
      return { error: invalidServerUrlError };
    }
    // access token expired: the server session is already over
    if (HttpErrors.isUnauthorizedResponse(err)) {
      return {};
    }
    return { error: err.message };
  } finally {
    setAuthToken(null);
  }
};

// the server answers 401 when the refresh token is invalid, expired or revoked
const isRefreshTokenRejected = (error: any): boolean =>
  HttpErrors.isUnauthorizedResponse(error);

// returns true if the user has been logged in again with the credentials stored in the keychain
const loginWithStoredCredentials = async (): Promise<boolean> => {
  const serverUrl = await getServerUrl();
  const credentials = await SecureStoreService.getServerCredentials(serverUrl);
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

const performAuthTokensRefresh = async () => {
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
    // keep the previous refresh token if the server didn't send a new one
    if (refreshToken) {
      await SecureStoreService.setAuthRefreshToken(refreshToken);
    }
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

let authTokensRefreshInProgress: Promise<void> | null = null;

// the server revokes a refresh token once used: concurrent requests must share a single refresh
const refreshAuthTokens = (): Promise<void> => {
  authTokensRefreshInProgress ??= performAuthTokensRefresh().finally(() => {
    authTokensRefreshInProgress = null;
  });
  return authTokensRefreshInProgress;
};

export const AuthService = {
  authTokenRefreshUrl,
  clearStoredCredentials,
  fetchExternalLoginProviders,
  getAuthToken,
  generateAuthorizationHeaders,
  login,
  loginWithExternalLoginCode,
  loginWithTempAuthToken,
  logout,
  refreshAuthTokens,
  startExternalLogin,
};
