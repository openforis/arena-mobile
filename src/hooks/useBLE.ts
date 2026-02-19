import { useState, useRef, useCallback } from "react";
import {
  BleManager,
  Device,
  Characteristic,
  BleError,
} from "react-native-ble-plx";

import { Buffer } from "buffer";

import { Environment, log } from "utils";

const manager = Environment.isExpoGo ? null : new BleManager();

// T is a generic type for the parsed data (e.g., a number, a string, or an object)
interface BLEConfig<T> {
  serviceUUID?: string;
  characteristicUUID: string;
  deviceFilter?: (device: Device) => boolean;
  onRawData?: (raw: string) => T;
}

interface BLEHookReturn<T> {
  btData: T | null;
  isBtConnected: boolean;
  isBtScanning: boolean;
  scanBtAndConnect: () => void;
  disconnectBt: () => Promise<void>;
  btError: string | null;
}

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

  const deviceRef = useRef<Device | null>(null);

  const startMonitoring = useCallback(
    (device: Device) => {
      device.discoverAllServicesAndCharacteristics().then(() => {
        device
          .services()
          .then((services) => {
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
                  const decoded = Buffer.from(char.value, "base64").toString(
                    "utf-8",
                  );
                  log.debug(`BLE - received data: ${decoded}`);
                  // If a parser exists, use it; otherwise cast string to T
                  const processedData = onRawData
                    ? onRawData(decoded)
                    : (decoded as unknown as T);
                  setBtData(processedData);
                }
              },
            );
          })
          .catch((err) => {
            log.debug(`BLE - error discovering services: ${err.message}`);
          });
      });
    },
    [serviceUUID, characteristicUUID, onRawData],
  );

  const scanBtAndConnect = useCallback(() => {
    if (!manager) return;

    setBtError(null);
    setIsBtScanning(true);

    manager.startDeviceScan(
      serviceUUID ? [serviceUUID] : null,
      null,
      async (err: BleError | null, device: Device | null) => {
        if (err) {
          setBtError(err.message);
          setIsBtScanning(false);
          return;
        }

        if (device && deviceFilter(device)) {
          log.debug(
            `BLE - found matching device: ${device.name} (${device.id})`,
          );

          manager.stopDeviceScan();
          setIsBtScanning(false);

          try {
            const connectedDevice = await device.connect();
            await connectedDevice.discoverAllServicesAndCharacteristics();
            deviceRef.current = connectedDevice;
            setIsBtConnected(true);

            startMonitoring(connectedDevice);
          } catch (e: any) {
            setBtError(e.message || "Connection failed");
            log.debug(
              `BLE - connection failed: ${e.message || "Unknown error"}`,
            );
          }
        }
      },
    );
  }, [serviceUUID, deviceFilter, startMonitoring]);

  const disconnectBt = async () => {
    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
      setIsBtConnected(false);
      setBtData(null);
    }
  };

  return {
    btData,
    isBtConnected,
    isBtScanning,
    scanBtAndConnect,
    disconnectBt,
    btError,
  };
}
