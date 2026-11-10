import * as Device from "expo-device";

export type DeviceInfoState = {
  batteryLevel: number;
  batteryState: string;
  batteryLevelAtStartTime: number;
  batteryLevelMeasureStartTime: number;
  batteryTimeToDischarge?: number | null;
  batteryTimeToFullCharge?: number | null;
  deviceType: Device.DeviceType;
  freeDiskStorage: number;
  isNetworkConnected: boolean | null;
  orientation: number | null;
};
