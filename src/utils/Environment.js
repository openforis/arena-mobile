import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";

const platform = Platform.OS;
const androidApiLevel = Device.platformApiLevel;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = platform === "android";
const isIOS = platform === "ios";

const pkg = Constants.expoConfig.android
  ? Constants.expoConfig.android.package
  : "host.exp.exponent";

export const Environment = {
  androidApiLevel,
  isExpoGo,
  isAndroid,
  isIOS,
  pkg,
  platform,
};
