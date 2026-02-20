import { useCallback, useEffect, useState } from "react";
import { useBluetoothDeviceLookup } from "./useBluetoothDeviceLookup";
import { BluetoothDeviceKind } from "utils/BluetoothScanner";
import { bluetoothClassicConnector } from "utils/BluetoothClassicConnector";
import { log } from "utils/Logger";
import { useBLE } from "./useBLE";

export const useBluetoothDevice = ({
  onRawData,
}: {
  onRawData: (raw: string) => void;
}) => {
  const {
    lookupDevice,
    isBtScanning,
    error: deviceLookupError,
  } = useBluetoothDeviceLookup();

  const { connectBle, disconnectBle, bleError, isBleConnected } = useBLE<any>({
    // serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    // characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    // deviceFilter: (device) =>
    //   ["TruPulse", "Garmin"].some(
    //     (name) => device.name?.includes(name) ?? false,
    //   ),
    onRawData: (raw) => {
      onRawData(raw);
      // const parts = raw.split(',');
      // return {
      //   distance: parseFloat(parts[2]!),
      //   angle: parseFloat(parts[4]!),
      // };
    },
  });

  const [connectedClassicDeviceId, setConnectedClassicDeviceId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const btScanAndConnect = useCallback(async () => {
    const device = await lookupDevice({
      filterFn: (device) => !!device.name && device.name !== device.id,
    });
    if (!device) return;

    const { id: deviceId, kind } = device!;
    if (kind === BluetoothDeviceKind.ble) {
      await bluetoothClassicConnector.disconnect();
      setConnectedClassicDeviceId(null);
      await connectBle({
        deviceId,
        serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
        characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
      });
    } else {
      log.debug(`Connecting to classic BT device ${deviceId}...`);
      await disconnectBle();
      const classicDevice = await bluetoothClassicConnector.connect({
        deviceId,
        onRawData,
      });
      setConnectedClassicDeviceId(classicDevice.id);
    }
  }, [connectBle, disconnectBle, lookupDevice, onRawData]);

  const btDeviceDisconnect = useCallback(async () => {
    if (connectedClassicDeviceId) {
      try {
        await bluetoothClassicConnector.disconnect(connectedClassicDeviceId);
      } catch (error: any) {
        const errorMessage = error?.message ?? String(error);
        setError(errorMessage);
        log.error(`Classic BT disconnect error: ${errorMessage}`);
      } finally {
        setConnectedClassicDeviceId(null);
      }
      return;
    }
    await disconnectBle();
  }, [connectedClassicDeviceId, disconnectBle]);

  useEffect(() => {
    return () => {
      // Ensure we disconnect BT when the screen unmounts
      disconnectBle();
      bluetoothClassicConnector.disconnect().catch((error: unknown) => {
        log.error(`Classic BT disconnect error on unmount: ${String(error)}`);
      });
    };
  }, [disconnectBle]);

  return {
    btScanAndConnect,
    btDeviceDisconnect,
    isBtConnected: isBleConnected || !!connectedClassicDeviceId,
    isBtScanning,
    connectedClassicDeviceId,
    error: deviceLookupError || bleError || error,
  };
};
