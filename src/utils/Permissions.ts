import { PermissionsAndroid } from "react-native";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
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

const requestImagePickerMediaLibraryPermissions = async () => {
  const { granted } =
    await ImagePicker.requestMediaLibraryPermissionsAsync(true);
  return granted;
};

const requestMicrophonePermissions = async (): Promise<boolean> => {
  const currentStatus = await getRecordingPermissionsAsync();
  if (currentStatus.granted) {
    return true;
  }
  const requestedStatus = await requestRecordingPermissionsAsync();
  return requestedStatus.granted;
};

/**
 * Requests the runtime Bluetooth permission needed to connect to an already-paired
 * external GPS device. Only relevant on Android API 31+ (BLUETOOTH_CONNECT became a
 * runtime permission there); below that, BLUETOOTH/BLUETOOTH_ADMIN are install-time
 * permissions. On iOS, CoreBluetooth/External Accessory show their own system
 * permission dialog automatically (driven by NSBluetoothAlwaysUsageDescription in
 * app.config.ts), so there's no equivalent manual request to perform.
 */
const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (
    !Environment.isExpoGo &&
    Environment.isAndroid &&
    Environment.androidApiLevel >= 31
  ) {
    const permission = i18n.t("permissions:types.bluetoothConnect");
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
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

/**
 * Requests whatever runtime permission is needed to run Bluetooth Classic device
 * discovery (RNBluetoothClassic.startDiscovery()) for on-demand external GPS pairing.
 *
 * - API 31+ (Android 12+): only the BLUETOOTH_SCAN runtime permission is needed.
 *   react-native-bluetooth-classic declares it with usesPermissionFlags="neverForLocation"
 *   in its own AndroidManifest.xml, so no location permission or "Location services on"
 *   check applies here.
 * - API 23-30: BluetoothAdapter.startDiscovery() is gated by the *location* runtime
 *   permission plus the device's system Location toggle being on instead - both already
 *   requested for internal GPS via requestLocationForegroundPermission()/
 *   isLocationServiceEnabled(), so they're reused here rather than duplicated. Getting
 *   either of these wrong makes startDiscovery() silently resolve with zero devices.
 * - Below API 23: no runtime permission model, nothing to request.
 */
const requestBluetoothScanPermissions = async (): Promise<boolean> => {
  if (Environment.isExpoGo || !Environment.isAndroid) {
    return true;
  }

  if (Environment.androidApiLevel >= 31) {
    const permission = i18n.t("permissions:types.bluetoothScan");
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
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

  if (Environment.androidApiLevel >= 23) {
    if (!(await isLocationServiceEnabled())) {
      return false;
    }
    return requestLocationForegroundPermission();
  }

  return true;
};

export const Permissions = {
  isLocationServiceEnabled,
  requestLocationForegroundPermission,
  requestAccessMediaLocation,
  requestImagePickerMediaLibraryPermissions,
  requestMicrophonePermissions,
  requestBluetoothPermissions,
  requestBluetoothScanPermissions,
};
