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

  const {
    connectBle,
    disconnectBle,
    listBleServicesAndCharacteristics,
    bleError,
    isBleConnected,
  } = useBLE<any>({
    onRawData: (raw) => {
      onRawData(raw);
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
      });

      const services = await listBleServicesAndCharacteristics({ deviceId });
      if (services.length > 0) {
        const servicesSummary = services
          .map(
            (service) =>
              `- Service ${service.uuid}: ${service.characteristics.join(", ") || "(no characteristics)"}`,
          )
          .join("\n");

        log.debug(
          `BLE device ${deviceId} services/characteristics:\n${servicesSummary}`,
        );

        const monitorDurationMs = 10_000;

        for (const service of services) {
          for (const characteristicUUID of service.characteristics) {
            try {
              log.debug(
                `BLE monitoring start - device: ${deviceId}, service: ${service.uuid}, characteristic: ${characteristicUUID}, durationMs: ${monitorDurationMs}`,
              );

              await connectBle({
                deviceId,
                serviceUUID: service.uuid,
                characteristicUUID,
              });

              await new Promise<void>((resolve) => {
                setTimeout(() => resolve(), monitorDurationMs);
              });

              log.debug(
                `BLE monitoring end - device: ${deviceId}, service: ${service.uuid}, characteristic: ${characteristicUUID}`,
              );
            } catch (error: any) {
              log.error(
                `BLE monitoring error - device: ${deviceId}, service: ${service.uuid}, characteristic: ${characteristicUUID}, error: ${error?.message ?? String(error)}`,
              );
            } finally {
              await disconnectBle();
            }
          }
        }
      }
    } else {
      log.debug(`Connecting to classic BT device ${deviceId}...`);
      await disconnectBle();
      const classicDevice = await bluetoothClassicConnector.connect({
        deviceId,
        onRawData,
      });
      setConnectedClassicDeviceId(classicDevice.id);
    }
  }, [
    connectBle,
    disconnectBle,
    listBleServicesAndCharacteristics,
    lookupDevice,
    onRawData,
  ]);

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
