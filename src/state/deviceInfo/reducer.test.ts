import { DeviceInfoReducer, DeviceInfoSliceActions } from "./reducer";
import type { DeviceInfoState } from "./types";

const deviceInfo = {
  batteryLevel: 0.5,
  freeDiskStorage: 100,
  isNetworkConnected: true,
  orientation: 1,
} as DeviceInfoState;

describe("DeviceInfoReducer", () => {
  it("starts from an empty state", () => {
    expect(DeviceInfoReducer(undefined, { type: "@@INIT" })).toEqual({});
  });

  it("set replaces the whole state", () => {
    const state = DeviceInfoReducer(
      { ...deviceInfo, batteryTimeToDischarge: 10 },
      DeviceInfoSliceActions.set(deviceInfo),
    );
    expect(state).toEqual(deviceInfo);
  });

  it("update merges into the previous state", () => {
    const state = DeviceInfoReducer(
      deviceInfo,
      DeviceInfoSliceActions.update({ isNetworkConnected: false }),
    );
    expect(state).toEqual({ ...deviceInfo, isNetworkConnected: false });
  });
});
