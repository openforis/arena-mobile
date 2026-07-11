import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

import { log } from "utils";
import { ExternalGpsConnection, ExternalGpsTransport, GpsSourceDescriptor } from "../types";
import { recognizeVendor } from "./vendorProtocolRegistry";

const externalSourceId = (address: string) => `external:${address}`;

const toSourceDescriptor = (device: BluetoothDevice): GpsSourceDescriptor => ({
  id: externalSourceId(device.address),
  type: "external",
  label: device.name || device.address,
  vendor: recognizeVendor(device.name || ""),
});

const addressFromSourceId = (sourceId: string): string =>
  sourceId.replace(/^external:/, "");

/**
 * Lists bonded devices (Android) / connected MFi accessories (iOS) - both surfaced
 * through the same RNBluetoothClassic.getBondedDevices() call, since device pairing
 * is done at the OS level (see plan) and this transport never scans/pairs itself.
 * Only devices recognized by vendorProtocolRegistry are surfaced, since most bonded
 * devices (headphones, printers, etc) aren't GPS receivers.
 */
const listSources = async (): Promise<GpsSourceDescriptor[]> => {
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
    );
    return gpsDevices.map(toSourceDescriptor);
  } catch (error) {
    log.warn("ExternalGps: failed to list bonded devices", error);
    return [];
  }
};

const connect = async (sourceId: string): Promise<ExternalGpsConnection> => {
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
    disconnect: async () => {
      log.debug("ExternalGps: disconnecting from", device.name || address);
      await device.disconnect();
    },
  };
};

export const bluetoothClassicTransport: ExternalGpsTransport = {
  listSources,
  connect,
};
