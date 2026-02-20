import { PermissionsAndroid, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { i18n } from "localization/i18n";
import { Environment } from "./Environment";

const isLocationServiceEnabled = async (): Promise<boolean> => {
  const providerStatus = await Location.getProviderStatusAsync();
  return providerStatus.locationServicesEnabled;
};

const requestLocationForegroundPermission = async (): Promise<boolean> => {
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

const requestAccessMediaLocation = async (): Promise<boolean> => {
  if (
    !Environment.isExpoGo &&
    Environment.isAndroid &&
    Environment.androidApiLevel >= 10
  ) {
    const permission = i18n.t("permissions:types.accessMediaLocation");
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
      {
        title: i18n.t("permissions:permissionRequest.title", { permission }),
        message: i18n.t("permissions:permissionRequest.message", {
          permission,
        }),
        buttonNegative: i18n.t("common:cancel"),
        buttonPositive: i18n.t("common:ok"),
      },
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const requestImagePickerMediaLibraryPermissions =
  async (): Promise<boolean> => {
    const { granted } =
      await ImagePicker.requestMediaLibraryPermissionsAsync(true);
    return granted;
  };

const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Environment.isAndroid) {
    if (Environment.androidApiLevel >= 31) {
      // Android 12+ requires these specific ones
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // Android 11 and below only needs Location
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true; // iOS handles this via the app.json config automatically
};

export const Permissions = {
  isLocationServiceEnabled,
  requestLocationForegroundPermission,
  requestAccessMediaLocation,
  requestImagePickerMediaLibraryPermissions,
  requestBluetoothPermissions,
};
