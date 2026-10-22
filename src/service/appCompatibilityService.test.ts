import {
  AppCompatibilityOperation,
  AppCompatibilityService,
} from "./appCompatibilityService";
import { RemoteService } from "./remoteService";

jest.mock("./remoteService", () => ({
  RemoteService: { get: jest.fn() },
}));

jest.mock("utils/SystemUtils", () => ({
  SystemUtils: { getRecordAppInfo: () => ({ appId: "am", version: "2.5.0" }) },
}));

jest.mock("utils/Logger", () => ({
  log: { warn: jest.fn() },
}));

const mockServerVersionInfo = (data: any) =>
  (RemoteService.get as jest.Mock).mockResolvedValue({ data });

const fetchMinAppVersionIfNotSupported = (
  operation = AppCompatibilityOperation.recordsDownload,
) => AppCompatibilityService.fetchMinAppVersionIfNotSupported({ operation });

describe("AppCompatibilityService.fetchMinAppVersionIfNotSupported", () => {
  it("returns the min version when the app version is lower", async () => {
    mockServerVersionInfo({ minMobileAppVersionRecordsDownload: "2.6.0" });
    expect(await fetchMinAppVersionIfNotSupported()).toBe("2.6.0");
  });

  it("returns null when the app version is supported", async () => {
    mockServerVersionInfo({
      minMobileAppVersionRecordsDownload: "2.5.0",
      minMobileAppVersionRecordsUpload: "3.0.0",
    });
    expect(await fetchMinAppVersionIfNotSupported()).toBeNull();
    expect(
      await fetchMinAppVersionIfNotSupported(
        AppCompatibilityOperation.recordsUpload,
      ),
    ).toBe("3.0.0");
  });

  it("returns null when the server doesn't specify a min version or cannot be reached", async () => {
    mockServerVersionInfo({ version: "2.10.0" });
    expect(await fetchMinAppVersionIfNotSupported()).toBeNull();

    (RemoteService.get as jest.Mock).mockRejectedValue(
      new Error("Network Error"),
    );
    expect(await fetchMinAppVersionIfNotSupported()).toBeNull();
  });
});

describe("AppCompatibilityService.isAppVersionNotSupportedError", () => {
  it("detects the 426 status code", () => {
    expect(
      AppCompatibilityService.isAppVersionNotSupportedError({
        response: { status: 426 },
      }),
    ).toBe(true);
    expect(
      AppCompatibilityService.isAppVersionNotSupportedError({ status: 426 }),
    ).toBe(true);
    expect(
      AppCompatibilityService.isAppVersionNotSupportedError({
        response: { status: 500 },
      }),
    ).toBe(false);
  });
});
