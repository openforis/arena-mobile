import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";

const platform = Platform.OS;
const androidApiLevel = Device.platformApiLevel ?? 0;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = platform === "android";
const isIOS = platform === "ios";
const isWeb = platform === "web";
const pkg = Constants.expoConfig?.android?.package ?? "host.exp.exponent";

export const Environment = {
  androidApiLevel,
  isExpoGo,
  isAndroid,
  isIOS,
  isWeb,
  pkg,
  platform,
};
