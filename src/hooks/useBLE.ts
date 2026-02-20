import { useState, useRef, useCallback } from "react";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

import { Buffer } from "buffer";

import { Environment, log, Permissions } from "utils";

const manager = Environment.isExpoGo ? null : new BleManager();

// T is a generic type for the parsed data (e.g., a number, a string, or an object)
type BLEConfig<T> = {
  deviceFilter?: (device: Device) => boolean;
  onRawData?: (raw: string) => T;
};

type BLEHookReturn<T> = {
  btData: T | null;
  isBtConnected: boolean;
  isBtScanning?: boolean;
  connectBt: (params: {
    deviceId: string;
    serviceUUID: string;
    characteristicUUID: string;
  }) => Promise<void>;
  disconnectBt: () => Promise<void>;
  btError: string | null;
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
  onRawData,
}: Omit<BLEConfig<T>, "deviceFilter">): BLEHookReturn<T> {
  const [btData, setBtData] = useState<T | null>(null);
  const [isBtConnected, setIsBtConnected] = useState(false);
  const [btError, setBtError] = useState<string | null>(null);

  const deviceRef = useRef<Device | null>(null);
  const monitoringSubscriptionRef = useRef<Subscription | null>(null);

  const startMonitoring = useCallback(
    async ({
      device,
      serviceUUID,
      characteristicUUID,
    }: {
      device: Device;
      serviceUUID: string;
      characteristicUUID: string;
    }) => {
      try {
        // You must discover services before monitoring
        await device.discoverAllServicesAndCharacteristics();

        if (monitoringSubscriptionRef.current) {
          monitoringSubscriptionRef.current.remove();
          monitoringSubscriptionRef.current = null;
        }
        monitoringSubscriptionRef.current =
          device.monitorCharacteristicForService(
            serviceUUID!,
            characteristicUUID,
            (err, char) => {
              if (err) {
                setBtError(err.message);
                setIsBtConnected(false);
                return;
              }
              if (char?.value) {
                const decoded = Buffer.from(char.value, "base64").toString(
                  "utf-8",
                );
                const processedData = onRawData
                  ? onRawData(decoded)
                  : (decoded as unknown as T);
                setBtData(processedData);
              }
            },
          );
      } catch (e: any) {
        log.error(`BLE monitor error: ${e.message}`);
      }
    },
    [onRawData],
  );

  const connectBt = useCallback(
    async ({
      deviceId,
      serviceUUID,
      characteristicUUID,
    }: {
      deviceId: string;
      serviceUUID: string;
      characteristicUUID: string;
    }) => {
      if (!manager) return;

      const permissionGranted = await Permissions.requestBluetoothPermissions();
      if (!permissionGranted) {
        setBtError("Bluetooth permissions not granted");
        return;
      }

      setBtError(null);

      try {
        log.debug(`BLE - attempting direct connection to: ${deviceId}`);

        const device = await manager.connectToDevice(deviceId);

        log.debug(`BLE - connected to: ${device.id}`);

        deviceRef.current = device;
        setIsBtConnected(true);

        await startMonitoring({ device, serviceUUID, characteristicUUID });
      } catch (e: any) {
        log.error(`BLE connection error: ${e.message}`);
        setBtError(e.message || "Direct connection failed");
        setIsBtConnected(false);
      }
    },
    [startMonitoring],
  );

  const disconnectBt = useCallback(async () => {
    setIsBtConnected(false);
    setBtData(null);

    if (monitoringSubscriptionRef.current) {
      monitoringSubscriptionRef.current.remove();
      monitoringSubscriptionRef.current = null;
    }
    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
  }, []);

  return {
    btData,
    isBtConnected,
    connectBt,
    disconnectBt,
    btError,
  };
}
