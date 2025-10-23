import { PermissionsAndroid } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { i18n } from "localization/i18n";
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
  if (
    !Environment.isExpoGo &&
    Environment.isAndroid &&
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    Environment.androidApiLevel >= 10
  ) {
    // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
    const permission = i18n.t("permissions:types.accessMediaLocation");
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
      {
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 2.
        title: i18n.t("permissions:permissionRequest.title", { permission }),
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 2.
        message: i18n.t("permissions:permissionRequest.message", {
          permission,
        }),
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
        buttonNegative: i18n.t("common:cancel"),
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
        buttonPositive: i18n.t("common:ok"),
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const requestImagePickerMediaLibraryPermissions = async () => {
  const { granted } =
    await ImagePicker.requestMediaLibraryPermissionsAsync(true);
  return granted;
};

export const Permissions = {
  isLocationServiceEnabled,
  requestLocationForegroundPermission,
  requestAccessMediaLocation,
  requestImagePickerMediaLibraryPermissions,
};
