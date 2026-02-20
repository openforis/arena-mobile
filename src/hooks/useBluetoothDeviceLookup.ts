import { useCallback, useState } from "react";
import {
  bluetoothScanner,
  BluetoothScanOptions,
  ScannedBluetoothDevice,
} from "utils/BluetoothScanner";
import { useToast } from "./useToast";
import { useConfirm } from "state/confirm";
import { log } from "utils/Logger";

export type UseBluetoothDeviceLookupReturn = {
  error: string | null;
  scanning: boolean;
  lookupDevice: (
    options?: BluetoothScanOptions,
  ) => Promise<ScannedBluetoothDevice | null>;
};

export const useBluetoothDeviceLookup = (): UseBluetoothDeviceLookupReturn => {
  const toaster = useToast();
  const confirm = useConfirm();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupDevice = async (
    options?: BluetoothScanOptions,
  ): Promise<ScannedBluetoothDevice | null> => {
    setScanning(true);
    setError(null);

    try {
      const devices = await bluetoothScanner.scanDevices(options);

      if (devices.length === 0) {
        toaster("app:testBluetoothDevices.noDevicesFound");
        return null;
      }

      const confirmResult = await confirm({
        titleKey: "app:testBluetoothDevices.scanResults",
        singleChoiceOptions: devices.map((d) => ({
          label: d.name ?? d.id,
          value: d.id,
        })),
      });

      if (!confirmResult) {
        return null;
      }
      const selectedDeviceId = confirmResult.selectedSingleChoiceValue!;
      const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

      if (!selectedDevice) {
        return null;
      }
      log.debug(
        `Selected Bluetooth device: ${selectedDevice.name} [${selectedDevice.kind}]`,
      );
      return selectedDevice;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setScanning(false);
    }
  };

  return { error, scanning, lookupDevice };
};
