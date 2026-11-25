import { API } from "../api";
import { AuthService } from "../auth/authService";
import { RemoteService } from "./remoteService";

jest.mock("../api", () => ({
  API: {
    del: jest.fn(),
    get: jest.fn(),
    getFileOrThrow: jest.fn(),
    post: jest.fn(),
    postCancelableMultipartData: jest.fn(),
  },
}));

jest.mock("../auth/authService", () => ({
  AuthService: {
    generateAuthorizationHeaders: () => ({}),
    refreshAuthTokens: jest.fn(),
  },
}));

jest.mock("../settings/settingsService", () => ({
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

describe("RemoteService get/post/del", () => {
  it("send the request to the server url with the app version header", async () => {
    (API.get as jest.Mock).mockResolvedValueOnce("got");
    (API.post as jest.Mock).mockResolvedValueOnce("posted");
    (API.del as jest.Mock).mockResolvedValueOnce("deleted");

    await expect(
      RemoteService.get("api/a", { p: 1 }, { timeout: 5 }),
    ).resolves.toBe("got");
    await expect(RemoteService.post("api/b", { p: 2 })).resolves.toBe("posted");
    await expect(RemoteService.del("api/c")).resolves.toBe("deleted");

    const headers = { "X-Arena-Mobile-App-Version": "1.0.0" };
    expect((API.get as jest.Mock).mock.calls[0][0]).toEqual({
      serverUrl: "https://arena.test",
      uri: "api/a",
      data: { p: 1 },
      config: { timeout: 5, headers },
    });
    expect((API.post as jest.Mock).mock.calls[0][0]).toEqual({
      serverUrl: "https://arena.test",
      uri: "api/b",
      data: { p: 2 },
      config: { headers },
    });
    expect((API.del as jest.Mock).mock.calls[0][0]).toMatchObject({
      serverUrl: "https://arena.test",
      uri: "api/c",
      config: { headers },
    });
  });

  it("post refreshes the token and sends the request again after a 401", async () => {
    refreshMock.mockClear();
    (API.post as jest.Mock)
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce("posted");

    await expect(RemoteService.post("api/b")).resolves.toBe("posted");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
