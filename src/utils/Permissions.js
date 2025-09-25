import * as Location from "expo-location";
import { PermissionsAndroid } from "react-native";
import { Environment } from "./Environment";

const isLocationServiceEnabled = async () => {
  const providerStatus = await Location.getProviderStatusAsync();
  return providerStatus.locationServicesEnabled;
};

const requestLocationForegroundPermission = async () => {
  if (!(await isLocationServiceEnabled())) {
    return false;
  }
  const currentStatus = await Location.getForegroundPermissionsAsync();
  if (currentStatus.granted) {
    return true;
  }
  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();
  return foregroundPermission.granted;
};

const requestAccessMediaLocation = async () => {
  if (Environment.isAndroid) {
    try {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
        {
          title: "Arena Mobile needs Media Location Permission",
          message: "Arena Mobile needs access to media location.",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    } catch (_error) {
      return false;
    }
  }
  return true;
};

export const Permissions = {
  isLocationServiceEnabled,
  requestLocationForegroundPermission,
  requestAccessMediaLocation,
};
