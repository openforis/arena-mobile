import { API } from "./api";
import { AuthService } from "./authService";
import { SecureStoreService } from "./SecureStoreService";

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
  },
}));

jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getApplicationInfo: async () => ({ appId: "am" }) },
}));

const postMock = API.post as jest.Mock;
const setAuthRefreshTokenMock =
  SecureStoreService.setAuthRefreshToken as jest.Mock;

describe("AuthService.refreshAuthTokens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStoreService.getAuthRefreshToken as jest.Mock).mockResolvedValue(
      "refresh-token",
    );
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
