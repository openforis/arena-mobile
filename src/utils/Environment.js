import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

const platform = Platform.OS;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = platform === "android";
const isIOS = platform === "ios";

const pkg = Constants.expoConfig.android
  ? Constants.expoConfig.android.package
  : "host.exp.exponent";

export const Environment = {
  isExpoGo,
  isAndroid,
  isIOS,
  platform,
  pkg,
};
