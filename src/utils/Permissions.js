import { PermissionsAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";

import { i18n } from "localization/i18n";
import { Environment } from "./Environment";

const mediaLibraryGranularPermissions = ["photo", "video"];

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
    const permission = i18n.t("permissions:accessMediaLocation");
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
      {
        title: i18n.t("permissions:permissionRequestTitle", { permission }),
        message: i18n.t("permissions:permissionRequestMessage", { permission }),
        buttonNegative: i18n.t("common:cancel"),
        buttonPositive: i18n.t("common:ok"),
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const requestImagePickerMediaLibraryPermissions = async () => {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return result.granted;
};

const requestMediaLibraryPermissions = async () => {
  const result = Environment.isExpoGo
    ? { status: MediaLibrary.PermissionStatus.GRANTED, granted: true }
    : await MediaLibrary.requestPermissionsAsync(
        false,
        mediaLibraryGranularPermissions
      );
  return result.granted;
};

export const Permissions = {
  isLocationServiceEnabled,
  requestLocationForegroundPermission,
  requestAccessMediaLocation,
  requestImagePickerMediaLibraryPermissions,
  requestMediaLibraryPermissions,
};
