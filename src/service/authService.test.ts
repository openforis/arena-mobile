import { API } from "./api";
import { AuthService } from "./authService";
import { SecureStoreService } from "./SecureStoreService";
import { SettingsService } from "./settingsService";

jest.mock("./api", () => ({ API: { post: jest.fn() } }));

jest.mock("./SecureStoreService", () => ({
  SecureStoreService: {
    getAuthRefreshToken: jest.fn(),
    setAuthRefreshToken: jest.fn(),
  },
}));

jest.mock("./settingsService", () => ({
  SettingsService: {
    fetchSettings: async () => ({ serverUrl: "https://arena.test" }),
    getCredentials: jest.fn(),
    setCredentials: jest.fn(),
    resetCredentials: jest.fn(),
  },
}));

jest.mock("utils/Logger", () => ({ log: { warn: jest.fn() } }));

jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getApplicationInfo: async () => ({ appId: "am" }) },
}));

const postMock = API.post as jest.Mock;
const setAuthRefreshTokenMock =
  SecureStoreService.setAuthRefreshToken as jest.Mock;
const getCredentialsMock = SettingsService.getCredentials as jest.Mock;
const setCredentialsMock = SettingsService.setCredentials as jest.Mock;
const resetCredentialsMock = SettingsService.resetCredentials as jest.Mock;

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
    jest.clearAllMocks();
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe("AuthService.refreshAuthTokens with stored credentials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
