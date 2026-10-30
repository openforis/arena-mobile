import { API } from "./api";
import { AuthService } from "./authService";
import { RemoteService } from "./remoteService";

jest.mock("./api", () => ({
  API: { postCancelableMultipartData: jest.fn() },
}));

jest.mock("./authService", () => ({
  AuthService: {
    authTokenRefreshUrl: "/auth/token/refresh",
    generateAuthorizationHeaders: () => ({}),
    refreshAuthTokens: jest.fn(),
  },
}));

jest.mock("./settingsService", () => ({
  SettingsService: {
    fetchSettings: async () => ({ serverUrl: "https://arena.test" }),
  },
}));

jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getRecordAppInfo: () => ({ version: "1.0.0" }) },
}));

const postMock = API.postCancelableMultipartData as jest.Mock;
const refreshMock = AuthService.refreshAuthTokens as jest.Mock;

describe("RemoteService.postCancelableMultipartData", () => {
  beforeEach(() => jest.clearAllMocks());

  it("refreshes the token and sends the request again after a 401", async () => {
    const cancelSecond = jest.fn();
    postMock
      .mockReturnValueOnce({
        promise: Promise.reject({ response: { status: 401 } }),
        cancel: jest.fn(),
      })
      .mockReturnValueOnce({
        promise: Promise.resolve({ data: "ok" }),
        cancel: cancelSecond,
      });

    const { promise, cancel } = await RemoteService.postCancelableMultipartData(
      "api/test",
      {},
      jest.fn(),
    );

    await expect(promise).resolves.toEqual({ data: "ok" });
    expect(refreshMock).toHaveBeenCalledTimes(1);

    cancel();
    expect(cancelSecond).toHaveBeenCalledTimes(1);
  });
});
