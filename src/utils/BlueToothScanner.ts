import { BleManager, Device, BleError } from "react-native-ble-plx";
import RNBluetoothClassic, {
  BluetoothDevice as ClassicDevice,
  StandardOptions as ClassicConnectionOptions,
} from "react-native-bluetooth-classic";

import { Environment } from "./Environment";
import { log } from "./Logger";
import { Permissions } from "./Permissions";

export enum BluetoothDeviceKind {
  ble = "ble",
  classic = "classic",
}

export type ScannedBluetoothDevice = {
  id: string;
  name?: string | null;
  localName?: string | null;
  kind: BluetoothDeviceKind;
  bleDevice?: Device;
  classicDevice?: ClassicDevice;
};

class BlueToothScanner {
  private manager: BleManager | null;
  private isScanning: boolean = false;
  private connectedClassicDeviceId: string | null = null;

  constructor() {
    this.manager = Environment.isExpoGo ? null : new BleManager();
  }

  /**
   * Scans for BLE devices for a set duration.
   * @param durationMs - How long to scan (default 5000ms)
   * @returns A promise resolving to an array of unique discovered Devices
   */
  public async scanDevices({
    durationMs = 5000,
    filterFn,
    scanBLE = true,
    scanClassic = true,
  }: {
    durationMs?: number;
    filterFn?: (device: ScannedBluetoothDevice) => boolean;
    scanBLE?: boolean;
    scanClassic?: boolean;
  } = {}): Promise<ScannedBluetoothDevice[]> {
    if (this.isScanning) {
      throw new Error("Scan already in progress");
    }

    const permissionGranted = await Permissions.requestBluetoothPermissions();
    if (!permissionGranted) {
      throw new Error("Bluetooth permissions not granted");
    }

    const discoveredMap = new Map<string, ScannedBluetoothDevice>();
    this.isScanning = true;

    log.debug(
      `Starting Bluetooth scan for ${durationMs}ms (BLE: ${scanBLE}, Classic: ${scanClassic})...`,
    );

    try {
      const scanPromises: Promise<void>[] = [];

      if (scanBLE) {
        scanPromises.push(
          this.scanBLEDevicesInternal({ durationMs, filterFn, discoveredMap }),
        );
      }

      if (scanClassic) {
        scanPromises.push(
          this.scanClassicDevicesInternal({ filterFn, discoveredMap }),
        );
      }

      const results = await Promise.allSettled(scanPromises);

      const firstFailure = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );
      if (firstFailure && discoveredMap.size === 0) {
        throw firstFailure.reason;
      }

      const devices = Array.from(discoveredMap.values());
      log.debug(
        `Bluetooth scan finished. Discovered devices: ${devices
          .map((d) => `${d.name ?? "Unnamed"} (${d.id}) - ${d.kind}`)
          .join(", ")}`,
      );
      return devices;
    } finally {
      this.stopScan();
    }
  }

  private stopScan() {
    this.manager?.stopDeviceScan();
    this.isScanning = false;
  }

  // Helper to get the manager instance if needed elsewhere
  public getManager(): BleManager | null {
    return this.manager;
  }

  public async connectClassicDevice({
    deviceId,
    options,
  }: {
    deviceId: string;
    options?: ClassicConnectionOptions;
  }): Promise<ClassicDevice> {
    const permissionGranted = await Permissions.requestBluetoothPermissions();
    if (!permissionGranted) {
      throw new Error("Bluetooth permissions not granted");
    }

    const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!isEnabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }

    const connectedDevice = await RNBluetoothClassic.connectToDevice(
      deviceId,
      options,
    );
    this.connectedClassicDeviceId = connectedDevice.id;
    return connectedDevice;
  }

  public async disconnectClassicDevice(deviceId?: string): Promise<boolean> {
    const resolvedDeviceId = deviceId ?? this.connectedClassicDeviceId;
    if (!resolvedDeviceId) return false;

    const disconnected =
      await RNBluetoothClassic.disconnectFromDevice(resolvedDeviceId);
    if (disconnected && resolvedDeviceId === this.connectedClassicDeviceId) {
      this.connectedClassicDeviceId = null;
    }
    return disconnected;
  }

  private scanBLEDevicesInternal({
    durationMs,
    filterFn,
    discoveredMap,
  }: {
    durationMs: number;
    filterFn?: (device: ScannedBluetoothDevice) => boolean;
    discoveredMap: Map<string, ScannedBluetoothDevice>;
  }): Promise<void> {
    if (!this.manager) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.manager?.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: BleError | null, device: Device | null) => {
          if (error) {
            this.manager?.stopDeviceScan();
            reject(error);
            return;
          }

          if (!device) return;

          const scannedDevice: ScannedBluetoothDevice = {
            id: device.id,
            name: device.name,
            localName: device.localName,
            kind: BluetoothDeviceKind.ble,
            bleDevice: device,
          };

          if (!filterFn || filterFn(scannedDevice)) {
            discoveredMap.set(device.id, scannedDevice);
          }
        },
      );

      setTimeout(() => {
        this.manager?.stopDeviceScan();
        resolve();
      }, durationMs);
    });
  }

  private async scanClassicDevicesInternal({
    filterFn,
    discoveredMap,
  }: {
    filterFn?: (device: ScannedBluetoothDevice) => boolean;
    discoveredMap: Map<string, ScannedBluetoothDevice>;
  }): Promise<void> {
    const isBluetoothEnabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!isBluetoothEnabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }

    const [discoveredDevices, connectedDevices] = await Promise.all([
      RNBluetoothClassic.startDiscovery().catch((error) => {
        log.error(`Classic discovery failed: ${String(error)}`);
        return [] as ClassicDevice[];
      }),
      RNBluetoothClassic.getConnectedDevices().catch((error) => {
        log.error(`Classic connected-devices fetch failed: ${String(error)}`);
        return [] as ClassicDevice[];
      }),
    ]);

    const allDevices = [...discoveredDevices, ...connectedDevices].filter(
      (device) => device.type === "CLASSIC" || device.type === "DUAL",
    );

    for (const device of allDevices) {
      const { id, name } = device;
      const scannedDevice: ScannedBluetoothDevice = {
        id,
        name,
        localName: null,
        kind: BluetoothDeviceKind.classic,
        classicDevice: device,
      };
      log.debug(`Discovered classic device: ${name ?? "Unnamed"} (${id})`);

      if (!filterFn || filterFn(scannedDevice)) {
        discoveredMap.set(device.id, scannedDevice);
      }
    }
  }
}

// Export a singleton instance
export const bleScanner = new BlueToothScanner();
