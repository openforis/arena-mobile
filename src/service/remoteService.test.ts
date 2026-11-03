import { API } from "./api";
import { AuthService } from "./authService";
import { RemoteService } from "./remoteService";

jest.mock("./api", () => ({
  API: { getFileOrThrow: jest.fn(), postCancelableMultipartData: jest.fn() },
}));

jest.mock("./authService", () => ({
  AuthService: {
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

  it("does not send the request again if canceled during the refresh", async () => {
    postMock.mockReturnValueOnce({
      promise: Promise.reject({ response: { status: 401 } }),
      cancel: jest.fn(),
    });
    let endRefresh: () => void = () => {};
    refreshMock.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        endRefresh = resolve;
      }),
    );

    const { promise, cancel } = await RemoteService.postCancelableMultipartData(
      "api/test",
      {},
      jest.fn(),
    );
    await new Promise(process.nextTick);
    cancel();
    endRefresh();

    await expect(promise).rejects.toThrow();
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it("sends the chunk without timeout", async () => {
    postMock.mockReturnValueOnce({ promise: Promise.resolve(), cancel() {} });

    await RemoteService.postCancelableMultipartData("api/test", {}, jest.fn());

    expect(postMock.mock.calls[0][0].config.timeout).toBe(0);
  });
});

describe("RemoteService.getFileOrThrow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("refreshes the token and downloads the file again after a 401", async () => {
    const getFileMock = API.getFileOrThrow as jest.Mock;
    getFileMock
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce("file://export.zip");

    await expect(RemoteService.getFileOrThrow("api/file")).resolves.toBe(
      "file://export.zip",
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
