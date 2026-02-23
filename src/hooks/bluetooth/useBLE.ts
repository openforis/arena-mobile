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
  bleData: T | null;
  isBleConnected: boolean;
  connectBle: (params: {
    deviceId: string;
    serviceUUID?: string;
    characteristicUUID?: string;
  }) => Promise<void>;
  disconnectBle: () => Promise<void>;
  listBleServicesAndCharacteristics: (params?: {
    deviceId?: string;
  }) => Promise<{ uuid: string; characteristics: string[] }[]>;
  bleError: string | null;
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

export const useBLE = <T>({
  onRawData,
}: Omit<BLEConfig<T>, "deviceFilter">): BLEHookReturn<T> => {
  const [bleData, setBleData] = useState<T | null>(null);
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);

  const deviceRef = useRef<Device | null>(null);
  const monitoringSubscriptionRef = useRef<Subscription | null>(null);

  const unsubscribeFromMonitoring = () => {
    if (monitoringSubscriptionRef.current) {
      monitoringSubscriptionRef.current.remove();
      monitoringSubscriptionRef.current = null;
    }
  };

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

        unsubscribeFromMonitoring();

        monitoringSubscriptionRef.current =
          device.monitorCharacteristicForService(
            serviceUUID!,
            characteristicUUID,
            (err, char) => {
              if (err) {
                setBleError(err.message);
                setIsBleConnected(false);
                return;
              }
              if (char?.value) {
                const decoded = Buffer.from(char.value, "base64").toString(
                  "utf-8",
                );
                const processedData = onRawData
                  ? onRawData(decoded)
                  : (decoded as unknown as T);
                setBleData(processedData);
              }
            },
          );
      } catch (e: any) {
        log.error(`BLE monitor error: ${e.message}`);
      }
    },
    [onRawData],
  );

  const connectBle = useCallback(
    async ({
      deviceId,
      serviceUUID,
      characteristicUUID,
    }: {
      deviceId: string;
      serviceUUID?: string;
      characteristicUUID?: string;
    }) => {
      if (!manager) return;

      const permissionGranted = await Permissions.requestBluetoothPermissions();
      if (!permissionGranted) {
        setBleError("Bluetooth permissions not granted");
        return;
      }

      setBleError(null);

      try {
        unsubscribeFromMonitoring();
        if (deviceRef.current) {
          try {
            await deviceRef.current.cancelConnection();
          } catch (e: any) {
            log.debug(
              `BLE - previous connection cleanup warning: ${e?.message ?? String(e)}`,
            );
          } finally {
            deviceRef.current = null;
            setIsBleConnected(false);
            setBleData(null);
          }
        }

        log.debug(`BLE - attempting direct connection to: ${deviceId}`);

        const device = await manager.connectToDevice(deviceId);

        log.debug(`BLE - connected to: ${device.id}`);

        deviceRef.current = device;
        setIsBleConnected(true);

        if (serviceUUID && characteristicUUID) {
          await startMonitoring({ device, serviceUUID, characteristicUUID });
        } else {
          log.debug(
            `BLE - connected to ${device.id} without monitor UUIDs; discovery-only mode`,
          );
        }
      } catch (e: any) {
        log.error(`BLE connection error: ${e.message}`);
        setBleError(e.message || "Direct connection failed");
        setIsBleConnected(false);
      }
    },
    [startMonitoring],
  );

  const disconnectBle = useCallback(async () => {
    setIsBleConnected(false);
    setBleData(null);

    unsubscribeFromMonitoring();

    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
  }, []);

  const listBleServicesAndCharacteristics = useCallback(
    async ({ deviceId }: { deviceId?: string } = {}) => {
      const connectedDevice = deviceRef.current;

      if (!connectedDevice) {
        setBleError("No BLE device connected");
        return [];
      }

      if (deviceId && connectedDevice.id !== deviceId) {
        setBleError("Connected BLE device does not match selected device");
        return [];
      }

      try {
        const discoveredDevice =
          await connectedDevice.discoverAllServicesAndCharacteristics();
        const services = await discoveredDevice.services();

        return await Promise.all(
          services.map(async (service) => {
            const characteristics = await service.characteristics();
            return {
              uuid: service.uuid,
              characteristics: characteristics.map((char) => char.uuid),
            };
          }),
        );
      } catch (e: any) {
        const errorMessage = e?.message ?? String(e);
        log.error(`BLE services discovery error: ${errorMessage}`);
        setBleError(errorMessage);
        return [];
      }
    },
    [],
  );

  return {
    bleData,
    isBleConnected,
    connectBle,
    disconnectBle,
    listBleServicesAndCharacteristics,
    bleError,
  };
};
