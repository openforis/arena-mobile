import { useState, useRef, useCallback } from "react";
import {
  BleManager,
  Device,
  Characteristic,
  BleError,
} from "react-native-ble-plx";

import { Buffer } from "buffer";

import { Environment, log, Permissions } from "utils";

const manager = Environment.isExpoGo ? null : new BleManager();

// T is a generic type for the parsed data (e.g., a number, a string, or an object)
type BLEConfig<T> = {
  serviceUUID?: string;
  characteristicUUID: string;
  deviceFilter?: (device: Device) => boolean;
  onRawData?: (raw: string) => T;
};

type BLEHookReturn<T> = {
  btData: T | null;
  isBtConnected: boolean;
  isBtScanning?: boolean;
  scanBtAndConnect: () => void;
  disconnectBt: () => Promise<void>;
  btError: string | null;
  btConnectedDevices: ConnectedDeviceInfo[];
};

type ConnectedDeviceInfo = {
  device: Device;
  services: {
    uuid: string;
    characteristics: string[]; // Array of characteristic UUIDs
  }[];
};

const fetchConnectedDeviceDetails = async (): Promise<
  ConnectedDeviceInfo[]
> => {
  const connectedDevices = (await manager?.connectedDevices([])) ?? [];

  log.debug(
    `BLE - currently connected devices: ${connectedDevices
      .map((d) => d.name)
      .join(", ")}`,
  );

  const details: ConnectedDeviceInfo[] = await Promise.all(
    connectedDevices.map(async (device) => {
      // 2. You MUST discover internals before reading them
      const discoveredDevice =
        await device.discoverAllServicesAndCharacteristics();

      // 3. Get all services
      const services = await discoveredDevice.services();

      // 4. For each service, get its characteristics
      const servicesWithChars = await Promise.all(
        services.map(async (service) => {
          const characteristics = await service.characteristics();
          return {
            uuid: service.uuid,
            characteristics: characteristics.map((c) => c.uuid),
          };
        }),
      );

      return {
        device: discoveredDevice,
        services: servicesWithChars,
      };
    }),
  );
  return details;
};

export function useBLE<T>({
  serviceUUID,
  characteristicUUID,
  deviceFilter = () => true,
  onRawData,
}: BLEConfig<T>): BLEHookReturn<T> {
  const [btData, setBtData] = useState<T | null>(null);
  const [isBtConnected, setIsBtConnected] = useState(false);
  const [isBtScanning, setIsBtScanning] = useState(false);
  const [btError, setBtError] = useState<string | null>(null);
  const [btConnectedDevices, setBtConnectedDetails] = useState<
    ConnectedDeviceInfo[]
  >([]);

  const deviceRef = useRef<Device | null>(null);

  const startMonitoring = useCallback(
    async (device: Device) => {
      await device.discoverAllServicesAndCharacteristics();

      const services = await device.services();
      log.debug(
        `BLE - discovered services: ${services.map((s) => s.uuid).join(", ")}`,
      );
      device.monitorCharacteristicForService(
        serviceUUID!, // Assuming serviceUUID is provided if characteristic is
        characteristicUUID,
        (err: BleError | null, char: Characteristic | null) => {
          if (err) {
            setBtError(err.message);
            setIsBtConnected(false);
            return;
          }

          if (char?.value) {
            const decoded = Buffer.from(char.value, "base64").toString("utf-8");
            log.debug(`BLE - received data: ${decoded}`);
            // If a parser exists, use it; otherwise cast string to T
            const processedData = onRawData
              ? onRawData(decoded)
              : (decoded as unknown as T);
            setBtData(processedData);
          }
        },
      );
    },
    [serviceUUID, characteristicUUID, onRawData],
  );

  const scanBtAndConnect = useCallback(async () => {
    if (!manager) return;

    const permissionGranted = await Permissions.requestBluetoothPermissions();

    if (!permissionGranted) {
      setBtError("Bluetooth permissions not granted");
      return;
    }
    setBtError(null);
    setIsBtScanning(true);

    manager.startDeviceScan(null, null, async (err, device) => {
      if (err) {
        setBtError(err.message);
        setIsBtScanning(false);
        return;
      }

      if (!device || !device.isConnectable) return;

      // log.debug(
      //   `BLE - scanning... found device: ${device?.name} (${device?.id})
      // RSSI: ${device?.rssi} ${device.localName} ${device.manufacturerData} ) ${device?.serviceUUIDs ? "with serviceUUIDs: " + device.serviceUUIDs.join(", ") : ""}`,
      // );

      // Search for the brand or model name
      if (device.name && deviceFilter(device)) {
        log.debug(`BLE - found device: ${device.name} (${device.id})`);

        // manager.stopDeviceScan();
        // setIsBtScanning(false);

        try {
          log.debug(
            `BLE - connecting to device: ${device.name} (${device.id})`,
          );
          let connectedDevice;
          if (await device.isConnected()) {
            connectedDevice = device;
          } else {
            connectedDevice = await device.connect();
          }
          log.debug(
            `BLE - connected to device: ${connectedDevice.name} (${connectedDevice.id})`,
          );
          await connectedDevice.discoverAllServicesAndCharacteristics();
          deviceRef.current = connectedDevice;
          setIsBtConnected(true);

          startMonitoring(connectedDevice);

          const details: ConnectedDeviceInfo[] =
            await fetchConnectedDeviceDetails();

          setBtConnectedDetails(details);
        } catch (e: any) {
          log.error(`BLE connection error: ${e.message}`);
          setBtError(e.message || "Connection failed");
        }
      }
    });
  }, [deviceFilter, startMonitoring]);

  const disconnectBt = useCallback(async () => {
    manager?.stopDeviceScan();

    setIsBtConnected(false);
    setIsBtScanning(false);
    setBtData(null);

    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
  }, []);

  return {
    btData,
    isBtConnected,
    scanBtAndConnect,
    btConnectedDevices,
    disconnectBt,
    btError,
  };
}
