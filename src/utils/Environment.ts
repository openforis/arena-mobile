import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";

const platform = Platform.OS;
const androidApiLevel = Device.platformApiLevel;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = platform === "android";
const isIOS = platform === "ios";

// @ts-expect-error TS(2531): Object is possibly 'null'.
const pkg = Constants.expoConfig.android
  // @ts-expect-error TS(2531): Object is possibly 'null'.
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
