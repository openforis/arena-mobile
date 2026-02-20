import { BleManager, Device, BleError } from "react-native-ble-plx";
import { log } from "./Logger";
import { Permissions } from "./Permissions";
import de from "localization/de";

class BLEScanner {
  private manager: BleManager;
  private isScanning: boolean = false;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Scans for BLE devices for a set duration.
   * @param durationMs - How long to scan (default 5000ms)
   * @returns A promise resolving to an array of unique discovered Devices
   */
  public async scanDevices({
    durationMs = 5000,
    filterFn,
  }: {
    durationMs?: number;
    filterFn?: (device: Device) => boolean;
  } = {}): Promise<Device[]> {
    if (this.isScanning) {
      throw new Error("Scan already in progress");
    }

    const permissionGranted = await Permissions.requestBluetoothPermissions();
    if (!permissionGranted) {
      throw new Error("Bluetooth permissions not granted");
    }

    return new Promise((resolve, reject) => {
      const discoveredMap = new Map<string, Device>();
      this.isScanning = true;

      log.debug(`Starting BLE scan for ${durationMs}ms...`);

      // 1. Start the hardware scan
      this.manager.startDeviceScan(
        null, // Scan for all services
        { allowDuplicates: false },
        (error: BleError | null, device: Device | null) => {
          if (error) {
            this.stopScan();
            reject(error);
            return;
          }

          if (!device) return;

          // Use Map to ensure we only keep unique device IDs
          if (!filterFn || filterFn(device)) {
            discoveredMap.set(device.id, device);
          }
        },
      );

      // 2. Set the timeout to stop scanning
      setTimeout(() => {
        this.stopScan();
        const devices = Array.from(discoveredMap.values());
        log.debug(
          `BLE scan finished. Discovered devices: ${devices.map((d) => `${d.name} (${d.id}) - ${d.localName}`).join(", ")}`,
        );
        resolve(devices);
      }, durationMs);
    });
  }

  private stopScan() {
    this.manager.stopDeviceScan();
    this.isScanning = false;
  }

  // Helper to get the manager instance if needed elsewhere
  public getManager(): BleManager {
    return this.manager;
  }
}

// Export a singleton instance
export const bleScanner = new BLEScanner();
