import { Dictionary } from "@openforis/arena-core";

import { API } from "./api";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";

const refreshTokenCookieName = "refreshToken";

const authTokenRefreshUrl = "/auth/token/refresh";

const extractCookieValue = (
  headers: Dictionary<string>,
  cookieName: string
): string | undefined => {
  const cookies = headers?.["set-cookie"];
  const cookie = cookies?.[0];
  if (!cookie) return undefined;
  // cookie string is in the format cookieName=cookieValue
  const endIndex = cookie.indexOf(";", cookieName.length + 1);
  return cookie.substring(
    cookieName.length + 1,
    endIndex > 0 ? endIndex : undefined
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

const generateAuthorizationHeaders = () => ({
  Authorization: `Bearer ${_authToken}`,
});

const getServerUrl = async () =>
  (await SettingsService.fetchSettings()).serverUrl;

const login = async ({ serverUrl: serverUrlParam, email, password }: any) => {
  const serverUrl = serverUrlParam ?? (await getServerUrl());
  try {
    const { data, response } = await API.post({
      serverUrl,
      uri: "/auth/login",
      data: {
        email,
        password,
      },
    });
    const { authToken, refreshToken } = extractAuthTokens(response);
    if (authToken && refreshToken) {
      setAuthToken(authToken);
      await SecureStoreService.setAuthRefreshToken(refreshToken);
      return data;
    }
    return { error: "authService:error.invalidCredentials" };
  } catch (err: any) {
    const { response } = err;
    if (!response) {
      return { error: "authService:error.invalidServerUrl" };
    }
    if (response.status === 401) {
      return { error: "authService:error.invalidCredentials" };
    }
    return { error: err };
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
      return { error: "authService:error.invalidServerUrl" };
    }
    return { error: err };
  }
};

const refreshAuthTokens = async () => {
  try {
    const serverUrl = await getServerUrl();
    const refreshTokenPrev = await SecureStoreService.getAuthRefreshToken();
    if (!refreshTokenPrev) {
      throw new Error("Error refreshing auth tokens; missing refresh token.");
    }
    const headers = { Cookie: `refreshToken=${refreshTokenPrev};` };
    const { response } = await API.post({
      serverUrl,
      uri: authTokenRefreshUrl,
      config: { headers },
    });
    const { authToken, refreshToken } = extractAuthTokens(response);
    setAuthToken(authToken);
    await SecureStoreService.setAuthRefreshToken(refreshToken);
  } catch (error) {
    // clear stored tokens
    setAuthToken(null);
    await SecureStoreService.setAuthRefreshToken(null);

    throw error;
  }
};

export const AuthService = {
  authTokenRefreshUrl,
  getAuthToken,
  generateAuthorizationHeaders,
  login,
  logout,
  refreshAuthTokens,
};
