import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothDeviceEvent,
} from "react-native-bluetooth-classic";

import { log, Permissions } from "utils";
import { ExternalGpsConnection, ExternalGpsTransport, GpsSourceDescriptor } from "../types";
import { recognizeVendor } from "./vendorProtocolRegistry";

const externalSourceId = (address: string) => `external:${address}`;

const toSourceDescriptor = (device: BluetoothDevice): GpsSourceDescriptor => ({
  id: externalSourceId(device.address),
  type: "external",
  label: (device.name || device.address).replaceAll(":", "-"),
  vendor: recognizeVendor(device.name || ""),
});

const addressFromSourceId = (sourceId: string): string =>
  sourceId.replace(/^external:/, "");

const isModuleAvailable = (): boolean =>
  Boolean(
    RNBluetoothClassic &&
      typeof RNBluetoothClassic.getBondedDevices === "function" &&
      typeof RNBluetoothClassic.isDeviceConnected === "function" &&
      typeof RNBluetoothClassic.getConnectedDevice === "function" &&
      typeof RNBluetoothClassic.connectToDevice === "function",
  );

const unavailableModuleErrorMessage =
  "ExternalGps: Bluetooth Classic native module is unavailable in this runtime (Expo Go does not include react-native-bluetooth-classic). Use a custom dev build to enable external GPS over Bluetooth.";

let didLogUnavailableModuleWarning = false;

const logUnavailableModuleWarningOnce = () => {
  if (didLogUnavailableModuleWarning) return;
  didLogUnavailableModuleWarning = true;
  log.warn(unavailableModuleErrorMessage);
};

/**
 * Lists bonded devices (Android) / connected MFi accessories (iOS) - both surfaced
 * through the same RNBluetoothClassic.getBondedDevices() call, since device pairing
 * is done at the OS level (see plan) and this transport never scans/pairs itself.
 * Only devices recognized by vendorProtocolRegistry are surfaced, since most bonded
 * devices (headphones, printers, etc) aren't GPS receivers.
 */
const listSources = async (): Promise<GpsSourceDescriptor[]> => {
  if (!isModuleAvailable()) {
    logUnavailableModuleWarningOnce();
    return [];
  }

  if (!(await Permissions.requestBluetoothPermissions())) {
    log.debug("ExternalGps: Bluetooth permission not granted, skipping bonded devices list");
    return [];
  }

  try {
    const devices = await RNBluetoothClassic.getBondedDevices();
    const gpsDevices = devices.filter((device) =>
      recognizeVendor(device.name || ""),
    );
    log.debug(
      "ExternalGps: found",
      gpsDevices.length,
      "recognized GPS device(s) out of",
      devices.length,
      "bonded",
      "- bonded device names:",
      devices.map((device) => device.name || device.address),
    );
    return gpsDevices.map(toSourceDescriptor);
  } catch (error) {
    log.warn("ExternalGps: failed to list bonded devices", error);
    return [];
  }
};

const isConnected = async (sourceId: string): Promise<boolean> => {
  if (!isModuleAvailable()) return false;
  try {
    return await RNBluetoothClassic.isDeviceConnected(
      addressFromSourceId(sourceId),
    );
  } catch (error) {
    log.warn(
      "ExternalGps: failed to check connection status for",
      sourceId,
      error,
    );
    return false;
  }
};

const connect = async (sourceId: string): Promise<ExternalGpsConnection> => {
  if (!isModuleAvailable()) {
    throw new Error(unavailableModuleErrorMessage);
  }

  const address = addressFromSourceId(sourceId);

  const alreadyConnected = await RNBluetoothClassic.isDeviceConnected(address);
  const device = alreadyConnected
    ? await RNBluetoothClassic.getConnectedDevice(address)
    : await RNBluetoothClassic.connectToDevice(address, {
        connectionType: "delimited",
        delimiter: "\n",
      });

  log.info("ExternalGps: connected to", device.name || address);

  return {
    onData: (listener) => {
      const subscription = device.onDataReceived((event) =>
        listener(event.data),
      );
      return { remove: () => subscription.remove() };
    },
    // The native side catches read/socket errors internally and surfaces them as
    // DEVICE_DISCONNECTED/ERROR events (e.g. device powered off mid-read) rather than
    // throwing back through the bridge, so this is the only way to learn a
    // previously-good connection has gone dead.
    onDisconnected: (listener) => {
      const matchesDevice = (event: BluetoothDeviceEvent) =>
        event.device?.address === address;
      const disconnectedSubscription = RNBluetoothClassic.onDeviceDisconnected(
        (event: BluetoothDeviceEvent) => {
          if (matchesDevice(event)) listener();
        },
      );
      const errorSubscription = RNBluetoothClassic.onError(
        (event: BluetoothDeviceEvent) => {
          if (matchesDevice(event)) listener();
        },
      );
      return {
        remove: () => {
          disconnectedSubscription.remove();
          errorSubscription.remove();
        },
      };
    },
    disconnect: async () => {
      log.debug("ExternalGps: disconnecting from", device.name || address);
      await device.disconnect();
    },
  };
};

export const bluetoothClassicTransport: ExternalGpsTransport = {
  listSources,
  connect,
  isConnected,
};
