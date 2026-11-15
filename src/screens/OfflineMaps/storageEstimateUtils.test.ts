import { checkStorageEstimate } from "./storageEstimateUtils";

const warningRatio = 0.8;

describe("checkStorageEstimate", () => {
  it("returns no warnings when the size or the free space are unknown", () => {
    const expected = {
      exceedsFreeSpace: false,
      freeSpaceUsageRatio: null,
      freeSpaceLow: false,
    };
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: null,
        freeDiskStorage: 100,
        warningRatio,
      }),
    ).toEqual(expected);
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: 50,
        freeDiskStorage: null,
        warningRatio,
      }),
    ).toEqual(expected);
  });

  it("detects when the size fits comfortably", () => {
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: 50,
        freeDiskStorage: 100,
        warningRatio,
      }),
    ).toEqual({
      exceedsFreeSpace: false,
      freeSpaceUsageRatio: 0.5,
      freeSpaceLow: false,
    });
  });

  it("detects low free space", () => {
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: 80,
        freeDiskStorage: 100,
        warningRatio,
      }),
    ).toEqual({
      exceedsFreeSpace: false,
      freeSpaceUsageRatio: 0.8,
      freeSpaceLow: true,
    });
  });

  it("detects when the size exceeds the free space (not reported as low)", () => {
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: 150,
        freeDiskStorage: 100,
        warningRatio,
      }),
    ).toEqual({
      exceedsFreeSpace: true,
      freeSpaceUsageRatio: 1.5,
      freeSpaceLow: false,
    });
  });

  it("returns no ratio when there is no free space", () => {
    expect(
      checkStorageEstimate({
        estimatedSizeBytes: 10,
        freeDiskStorage: 0,
        warningRatio,
      }),
    ).toEqual({
      exceedsFreeSpace: true,
      freeSpaceUsageRatio: null,
      freeSpaceLow: false,
    });
  });
});
