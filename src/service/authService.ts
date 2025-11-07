import { Dictionary } from "@openforis/arena-core/dist/common";
import { API } from "./api";
import { RemoteService } from "./remoteService";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";

const refreshTokenCookieName = "refreshToken";

const extractCookieValue = (
  headers: Dictionary<string>,
  cookieName: string
): string | undefined => {
  const cookies = headers?.["set-cookie"];
  const cookie = cookies?.[0];
  // cookie string is in the format cookieName=cookieValue
  return cookie?.substring(
    cookieName.length + 1,
    cookie.indexOf(";", cookieName.length + 1)
  );
};

const extractRefreshToken = (headers: any) =>
  extractCookieValue(headers, refreshTokenCookieName);

let _authToken: string;

const setAuthToken = (token: string) => {
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
    const { authToken } = data;
    const { headers } = response;
    const refreshToken = extractRefreshToken(headers);
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
    const res = await API.post({
      serverUrl: await getServerUrl(),
      uri: "/auth/logout",
    });
    return res?.data;
  } catch (err: any) {
    if (!err.response) {
      return { error: "authService:error.invalidServerUrl" };
    }
    return { error: err };
  }
};

export const AuthService = {
  login,
  logout,
  generateAuthorizationHeaders,
};
