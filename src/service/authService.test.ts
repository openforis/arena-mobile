import { createHash } from "node:crypto";
import * as WebBrowser from "expo-web-browser";

import { API } from "./api";
import {
  AuthService,
  invalidCredentialsError,
  invalidTwoFactorCodeError,
} from "./authService";
import { SecureStoreService } from "./SecureStoreService";

jest.mock("./api", () => ({ API: { get: jest.fn(), post: jest.fn() } }));

jest.mock("expo-crypto", () => {
  const nodeCrypto = jest.requireActual("node:crypto");
  return {
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    CryptoEncoding: { BASE64: "base64" },
    getRandomBytes: (count: number) =>
      new Uint8Array(nodeCrypto.randomBytes(count)),
    digestStringAsync: async (_algorithm: string, data: string) =>
      nodeCrypto.createHash("sha256").update(data).digest("base64"),
  };
});

jest.mock("expo-web-browser", () => ({ openAuthSessionAsync: jest.fn() }));

jest.mock("./SecureStoreService", () => ({
  SecureStoreService: {
    getAuthRefreshToken: jest.fn(),
    setAuthRefreshToken: jest.fn(),
    getServerCredentials: jest.fn(),
    setServerCredentials: jest.fn(),
    resetServerCredentials: jest.fn(),
  },
}));

jest.mock("./settingsService", () => ({
  SettingsService: {
    fetchSettings: async () => ({ serverUrl: "https://arena.test" }),
  },
}));

jest.mock("utils/Logger");

jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getApplicationInfo: async () => ({ appId: "am" }) },
}));

const postMock = API.post as jest.Mock;
const setAuthRefreshTokenMock =
  SecureStoreService.setAuthRefreshToken as jest.Mock;
const getCredentialsMock = SecureStoreService.getServerCredentials as jest.Mock;
const setCredentialsMock = SecureStoreService.setServerCredentials as jest.Mock;
const resetCredentialsMock =
  SecureStoreService.resetServerCredentials as jest.Mock;

const user = { uuid: "user-uuid" };

const loginSuccessResponse = {
  data: { user },
  response: {
    headers: { "set-cookie": ["refreshToken=login-token; Path=/"] },
    data: { authToken: "auth-token" },
  },
};

describe("AuthService.refreshAuthTokens", () => {
  beforeEach(() => {
    (SecureStoreService.getAuthRefreshToken as jest.Mock).mockResolvedValue(
      "refresh-token",
    );
  });

  it("shares a single refresh between concurrent callers", async () => {
    postMock.mockResolvedValue({
      response: {
        headers: { "set-cookie": ["refreshToken=new-token; Path=/"] },
        data: { authToken: "auth-token" },
      },
    });

    await Promise.all([
      AuthService.refreshAuthTokens(),
      AuthService.refreshAuthTokens(),
    ]);
    await AuthService.refreshAuthTokens();

    // the two concurrent callers count as one, the later call is a new refresh
    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it("stores the new refresh token", async () => {
    postMock.mockResolvedValue({
      response: {
        headers: { "set-cookie": ["refreshToken=new-token; Path=/"] },
        data: { authToken: "auth-token" },
      },
    });
    await AuthService.refreshAuthTokens();
    expect(setAuthRefreshTokenMock).toHaveBeenCalledWith("new-token");
  });

  it("reads the refresh token among other cookies", async () => {
    postMock.mockResolvedValue({
      response: {
        headers: {
          "set-cookie": ["other=x; Path=/", "refreshToken=new-token; Path=/"],
        },
        data: { authToken: "auth-token" },
      },
    });
    await AuthService.refreshAuthTokens();
    expect(setAuthRefreshTokenMock).toHaveBeenCalledWith("new-token");
  });

  it("keeps the stored refresh token when the response has no refresh token cookie", async () => {
    postMock.mockResolvedValue({
      response: {
        headers: { "set-cookie": ["other=x; Path=/"] },
        data: { authToken: "auth-token" },
      },
    });
    await AuthService.refreshAuthTokens();
    expect(setAuthRefreshTokenMock).not.toHaveBeenCalled();
  });

  it("clears the refresh token when the server rejects it", async () => {
    postMock.mockRejectedValue({ response: { status: 401 } });
    await expect(AuthService.refreshAuthTokens()).rejects.toBeDefined();
    expect(setAuthRefreshTokenMock).toHaveBeenCalledWith(null);
  });

  it("keeps the refresh token on network errors", async () => {
    postMock.mockRejectedValue(new Error("Network Error"));
    await expect(AuthService.refreshAuthTokens()).rejects.toBeDefined();
    expect(setAuthRefreshTokenMock).not.toHaveBeenCalled();
  });

  it("keeps the refresh token on server errors", async () => {
    postMock.mockRejectedValue({ response: { status: 503 } });
    await expect(AuthService.refreshAuthTokens()).rejects.toBeDefined();
    expect(setAuthRefreshTokenMock).not.toHaveBeenCalled();
  });
});

describe("AuthService.login", () => {
  it("stores the credentials after a successful login", async () => {
    postMock.mockResolvedValue(loginSuccessResponse);
    const res = await AuthService.login({ email: "a@b.c", password: "pwd" });
    expect(res.user).toEqual(user);
    expect(setCredentialsMock).toHaveBeenCalledWith(
      "https://arena.test",
      "a@b.c",
      "pwd",
    );
  });

  it("doesn't store the credentials when logging in with two-factor authentication", async () => {
    postMock.mockResolvedValue(loginSuccessResponse);
    await AuthService.login({
      email: "a@b.c",
      password: "pwd",
      twoFactorToken: "123456",
    });
    expect(setCredentialsMock).not.toHaveBeenCalled();
  });
});

describe("AuthService login errors", () => {
  it("returns the error message as a string on server errors", async () => {
    postMock.mockRejectedValue(
      Object.assign(new Error("Request failed with status code 500"), {
        response: { status: 500 },
      }),
    );
    const res = await AuthService.login({ email: "a@b.c", password: "pwd" });
    expect(res.error).toBe("Request failed with status code 500");
  });

  it("fails when the response has no refresh token cookie", async () => {
    postMock.mockResolvedValue({
      data: { user },
      response: {
        headers: { "set-cookie": ["other=x; Path=/"] },
        data: { authToken: "auth-token" },
      },
    });
    const res = await AuthService.login({ email: "a@b.c", password: "pwd" });
    expect(res.error).toBe(invalidCredentialsError);
  });

  it("reports a wrong 2FA code apart from wrong credentials", async () => {
    postMock.mockRejectedValue(
      Object.assign(new Error("Request failed with status code 401"), {
        response: { status: 401 },
      }),
    );
    const resWithCode = await AuthService.login({
      email: "a@b.c",
      password: "pwd",
      twoFactorToken: "123456",
    });
    expect(resWithCode.error).toBe(invalidTwoFactorCodeError);
    const resWithoutCode = await AuthService.login({
      email: "a@b.c",
      password: "pwd",
    });
    expect(resWithoutCode.error).toBe(invalidCredentialsError);
  });
});

describe("AuthService.logout", () => {
  beforeEach(async () => {
    postMock.mockResolvedValue(loginSuccessResponse);
    await AuthService.login({ email: "a@b.c", password: "pwd" });
  });

  it("sends the access token", async () => {
    postMock.mockResolvedValue({ data: {} });
    await AuthService.logout();
    expect(postMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        uri: "/auth/logout",
        config: { headers: { Authorization: "Bearer auth-token" } },
      }),
    );
  });

  it("succeeds when the access token has expired", async () => {
    postMock.mockRejectedValue(
      Object.assign(new Error("Request failed with status code 401"), {
        response: { status: 401 },
      }),
    );
    expect(await AuthService.logout()).toEqual({});
  });

  it("clears the auth token", async () => {
    postMock.mockResolvedValue({ data: {} });
    await AuthService.logout();
    expect(AuthService.getAuthToken()).toBeNull();
    expect(AuthService.generateAuthorizationHeaders()).toEqual({});
  });

  it("clears the auth token when the server call fails", async () => {
    postMock.mockRejectedValue(new Error("Network Error"));
    await AuthService.logout();
    expect(AuthService.getAuthToken()).toBeNull();
  });
});

describe("AuthService.refreshAuthTokens with stored credentials", () => {
  beforeEach(() => {
    (SecureStoreService.getAuthRefreshToken as jest.Mock).mockResolvedValue(
      "refresh-token",
    );
  });

  it("logs in again silently when the refresh token is rejected", async () => {
    getCredentialsMock.mockResolvedValue({
      username: "a@b.c",
      password: "pwd",
    });
    postMock
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce(loginSuccessResponse);
    await AuthService.refreshAuthTokens();
    expect(setAuthRefreshTokenMock).toHaveBeenLastCalledWith("login-token");
    expect(AuthService.getAuthToken()).toBe("auth-token");
  });

  it("clears the stored credentials when they are no longer valid", async () => {
    getCredentialsMock.mockResolvedValue({
      username: "a@b.c",
      password: "old-pwd",
    });
    postMock.mockRejectedValue({ response: { status: 401 } });
    await expect(AuthService.refreshAuthTokens()).rejects.toBeDefined();
    expect(resetCredentialsMock).toHaveBeenCalledWith("https://arena.test");
  });

  it("fails when there are no stored credentials", async () => {
    getCredentialsMock.mockResolvedValue(false);
    postMock.mockRejectedValue({ response: { status: 401 } });
    await expect(AuthService.refreshAuthTokens()).rejects.toBeDefined();
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});

describe("AuthService external login", () => {
  const getMock = API.get as jest.Mock;
  const openAuthSessionMock = WebBrowser.openAuthSessionAsync as jest.Mock;
  const serverUrl = "https://arena.test";
  const redirectUri = "org.openforis.arena-mobile://external-login";

  it("lists only the providers usable from the app", async () => {
    getMock.mockResolvedValue({
      data: [
        { id: "google", type: "google", label: "Google", mobileLogin: true },
        { id: "old", type: "oidc", label: "Old server" },
      ],
    });
    const providers = await AuthService.fetchExternalLoginProviders({
      serverUrl,
    });
    expect(providers.map((provider) => provider.id)).toEqual(["google"]);
  });

  it("lists no providers when the server doesn't support them", async () => {
    getMock.mockRejectedValue(
      Object.assign(new Error("Not found"), { response: { status: 404 } }),
    );
    expect(
      await AuthService.fetchExternalLoginProviders({ serverUrl }),
    ).toEqual([]);
  });

  it("starts the sign-in with a PKCE challenge of the returned verifier", async () => {
    openAuthSessionMock.mockResolvedValue({
      type: "success",
      url: `${redirectUri}?code=the-code`,
    });
    const res = await AuthService.startExternalLogin({
      serverUrl,
      providerId: "google",
    });
    expect(res.code).toBe("the-code");
    const [startUrl, redirectUrl] = openAuthSessionMock.mock.calls[0];
    expect(redirectUrl).toBe(redirectUri);
    const challenge = new URL(startUrl).searchParams.get("mobileCodeChallenge");
    expect(startUrl.startsWith(`${serverUrl}/auth/oidc/google?`)).toBe(true);
    expect(res.codeVerifier).toMatch(/^[\w-]{43}$/);
    expect(challenge).toBe(
      createHash("sha256").update(res.codeVerifier!).digest("base64url"),
    );
  });

  it("translates the errors sent by the server", async () => {
    openAuthSessionMock.mockResolvedValue({
      type: "success",
      url: `${redirectUri}?externalLoginError=externalLogin.userNotFound`,
    });
    const res = await AuthService.startExternalLogin({
      serverUrl,
      providerId: "google",
    });
    expect(res.error).toBe("authService:error.externalLogin.userNotFound");
  });

  it("reports a cancelled sign-in", async () => {
    openAuthSessionMock.mockResolvedValue({ type: "cancel" });
    const res = await AuthService.startExternalLogin({
      serverUrl,
      providerId: "google",
    });
    expect(res).toEqual({ cancelled: true });
  });

  it("exchanges the code for the session tokens and clears the stored credentials", async () => {
    postMock.mockResolvedValue(loginSuccessResponse);
    const res = await AuthService.loginWithExternalLoginCode({
      serverUrl,
      code: "the-code",
      codeVerifier: "the-verifier",
    });
    expect(res.user).toEqual(user);
    expect(postMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: "/auth/oidc/_mobile-token",
        data: expect.objectContaining({
          code: "the-code",
          codeVerifier: "the-verifier",
        }),
      }),
    );
    expect(setAuthRefreshTokenMock).toHaveBeenCalledWith("login-token");
    expect(resetCredentialsMock).toHaveBeenCalledWith(serverUrl);
  });

  it("asks for the 2FA code", async () => {
    postMock.mockResolvedValue({
      data: { twoFactorRequired: true },
      response: {},
    });
    const res = await AuthService.loginWithExternalLoginCode({
      serverUrl,
      code: "the-code",
      codeVerifier: "the-verifier",
    });
    expect(res).toEqual({ twoFactorRequired: true });
  });

  it("reports a wrong 2FA code and an expired sign-in", async () => {
    const unauthorized = (message: string) =>
      Object.assign(new Error("Request failed with status code 401"), {
        response: { status: 401, data: { message } },
      });
    postMock.mockRejectedValueOnce(
      unauthorized("externalLogin.invalidTwoFactorCode"),
    );
    const resWrongCode = await AuthService.loginWithExternalLoginCode({
      serverUrl,
      code: "the-code",
      codeVerifier: "the-verifier",
      twoFactorToken: "000000",
    });
    expect(resWrongCode.error).toBe(invalidTwoFactorCodeError);
    postMock.mockRejectedValueOnce(unauthorized("externalLogin.flowInvalid"));
    const resExpired = await AuthService.loginWithExternalLoginCode({
      serverUrl,
      code: "the-code",
      codeVerifier: "the-verifier",
    });
    expect(resExpired.error).toBe(
      "authService:error.externalLogin.flowInvalid",
    );
  });
});
