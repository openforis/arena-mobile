import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothDeviceEvent,
  BluetoothNativeDevice,
} from "react-native-bluetooth-classic";

import { log, Permissions } from "utils";
import {
  BluetoothDisabledError,
  BluetoothScanPermissionDeniedError,
  DiscoveredGpsDevice,
  ExternalGpsConnection,
  ExternalGpsTransport,
  GpsSourceDescriptor,
} from "../types";
import { recognizeVendor } from "./vendorProtocolRegistry";

const externalSourceId = (address: string) => `external:${address}`;

const toSourceDescriptor = (device: BluetoothDevice): GpsSourceDescriptor => ({
  id: externalSourceId(device.address),
  type: "external",
  label: (device.name || device.address).replaceAll(":", "-"),
  vendor: recognizeVendor(device.name || ""),
});

const toDiscoveredDevice = (
  device: BluetoothNativeDevice,
): DiscoveredGpsDevice => ({
  address: device.address,
  name: device.name || "",
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
      typeof RNBluetoothClassic.connectToDevice === "function" &&
      typeof RNBluetoothClassic.startDiscovery === "function" &&
      typeof RNBluetoothClassic.pairDevice === "function" &&
      typeof RNBluetoothClassic.onDeviceDiscovered === "function",
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

const isBluetoothEnabled = async (): Promise<boolean> => {
  if (!isModuleAvailable()) return false;
  return RNBluetoothClassic.isBluetoothEnabled();
};

const requestBluetoothEnabled = async (): Promise<boolean> => {
  if (!isModuleAvailable()) return false;
  return RNBluetoothClassic.requestBluetoothEnabled();
};

const startDiscovery = async (
  onDeviceDiscovered: (device: DiscoveredGpsDevice) => void,
  onFinished?: () => void,
): Promise<{ stop: () => Promise<void> }> => {
  if (!isModuleAvailable()) {
    throw new Error(unavailableModuleErrorMessage);
  }

  if (!(await Permissions.requestBluetoothScanPermissions())) {
    throw new BluetoothScanPermissionDeniedError();
  }

  if (!(await isBluetoothEnabled()) && !(await requestBluetoothEnabled())) {
    throw new BluetoothDisabledError();
  }

  const subscription = RNBluetoothClassic.onDeviceDiscovered(
    (event: BluetoothDeviceEvent) => {
      if (event.device) onDeviceDiscovered(toDiscoveredDevice(event.device));
    },
  );

  let stopped = false;

  try {
    // Not awaited: the native promise only resolves once the whole scan finishes
    // (~12s, or earlier via cancelDiscovery), while results are delivered live via
    // onDeviceDiscovered above; onFinished lets callers know that moment happened
    // without polling or guessing a timeout.
    RNBluetoothClassic.startDiscovery()
      .then(() => {
        subscription.remove();
        if (!stopped) onFinished?.();
      })
      .catch((error) => {
        subscription.remove();
        if (!stopped) {
          log.warn("ExternalGps: discovery failed", error);
          onFinished?.();
        }
      });
  } catch (error) {
    subscription.remove();
    throw error;
  }

  return {
    stop: async () => {
      stopped = true;
      subscription.remove();
      await RNBluetoothClassic.cancelDiscovery();
    },
  };
};

const pairDevice = async (address: string): Promise<GpsSourceDescriptor> => {
  if (!isModuleAvailable()) {
    throw new Error(unavailableModuleErrorMessage);
  }
  const device = await RNBluetoothClassic.pairDevice(address);
  log.info("ExternalGps: paired with", device.name || address);
  return toSourceDescriptor(device);
};

export const bluetoothClassicTransport: ExternalGpsTransport = {
  listSources,
  connect,
  isConnected,
  isBluetoothEnabled,
  requestBluetoothEnabled,
  startDiscovery,
  pairDevice,
};
