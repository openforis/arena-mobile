import { useCallback, useEffect, useState } from "react";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";

import { Button, Card, ScreenView, Text, VView } from "components";
import { useBLE, useToast } from "hooks";
import { SettingsModel, SettingsObject } from "model";
import { AppService } from "service/appService";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log, clearLogs } from "utils";
import { bleScanner, BluetoothDeviceKind } from "utils/BlueToothScanner";

import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

export const SettingsScreen = () => {
  log.debug(`rendering SettingsScreen`);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toaster = useToast();
  const [isBtScanning, setIsBtScanning] = useState(false);
  const [connectedClassicDeviceId, setConnectedClassicDeviceId] = useState<
    string | null
  >(null);
  const [classicBtError, setClassicBtError] = useState<string | null>(null);

  const { disconnectBt, isBtConnected, connectBt, btError } = useBLE<any>({
    // serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    // characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    // deviceFilter: (device) =>
    //   ["TruPulse", "Garmin"].some(
    //     (name) => device.name?.includes(name) ?? false,
    //   ),
    onRawData: (raw) => {
      log.debug(`Received BLE data: ${raw}`);
      // const parts = raw.split(',');
      // return {
      //   distance: parseFloat(parts[2]!),
      //   angle: parseFloat(parts[4]!),
      // };
    },
  });

  useEffect(() => {
    return () => {
      // Ensure we disconnect BT when the screen unmounts
      disconnectBt();
      bleScanner.disconnectClassicDevice().catch((error: unknown) => {
        log.error(`Classic BT disconnect error on unmount: ${String(error)}`);
      });
    };
  }, [disconnectBt]);

  const settingsStored = SettingsSelectors.useSettings();

  const [state, setState] = useState({ settings: settingsStored });

  const { settings } = state;

  const onPropValueChange =
    ({ key }: { key: keyof SettingsObject }) =>
    async (value: any) => {
      const oldValue = settings[key];
      if (value === oldValue) return;
      dispatch(SettingsActions.updateSetting({ key, value }));
      setState((statePrev) =>
        Objects.assocPath({ obj: statePrev, path: ["settings", key], value }),
      );
    };

  const onExportLogsPress = useCallback(async () => {
    await AppService.exportLogsAndShareThem();
  }, []);

  const onClearLogsPress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "app:logs.clear.confirmMessage",
      })
    ) {
      await clearLogs();
    }
  }, [confirm]);

  const scanBt = useCallback(async () => {
    setClassicBtError(null);
    setIsBtScanning(true);
    try {
      const devices = await bleScanner.scanDevices({
        filterFn: (device) => !!device.name && device.name !== device.id,
      });

      log.debug(
        `Discovered devices: ${devices.map((d) => `${d.name} [${d.kind}]`).join(", ")}`,
      );

      if (devices.length === 0) {
        toaster("app:testBluetoothDevices.noDevicesFound");
        return;
      }

      const confirmResult = await confirm({
        titleKey: "app:testBluetoothDevices.scanResults",
        singleChoiceOptions: devices.map((d) => ({
          label: d.name ?? d.id,
          value: d.id,
        })),
      });

      if (!confirmResult) {
        return;
      }

      const selectedDeviceId = confirmResult.selectedSingleChoiceValue!;
      const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

      if (!selectedDevice) {
        return;
      }

      if (selectedDevice.kind === BluetoothDeviceKind.ble) {
        await bleScanner.disconnectClassicDevice();
        setConnectedClassicDeviceId(null);
        await connectBt({
          deviceId: selectedDevice.id,
          serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
          characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
        });
      } else {
        await disconnectBt();
        const classicDevice = await bleScanner.connectClassicDevice({
          deviceId: selectedDevice.id,
        });
        setConnectedClassicDeviceId(classicDevice.id);
      }
    } catch (error: any) {
      const errorMessage = error?.message ?? String(error);
      setClassicBtError(errorMessage);
      log.error(`BT scan/connect error: ${errorMessage}`);
    } finally {
      setIsBtScanning(false);
    }
  }, [confirm, connectBt, disconnectBt, toaster]);

  const disconnectSelectedBt = useCallback(async () => {
    if (connectedClassicDeviceId) {
      try {
        await bleScanner.disconnectClassicDevice(connectedClassicDeviceId);
      } catch (error: any) {
        const errorMessage = error?.message ?? String(error);
        setClassicBtError(errorMessage);
        log.error(`Classic BT disconnect error: ${errorMessage}`);
      } finally {
        setConnectedClassicDeviceId(null);
      }
      return;
    }

    await disconnectBt();
  }, [connectedClassicDeviceId, disconnectBt]);

  return (
    <ScreenView>
      <VView style={styles.settingsWrapper}>
        <ConnectionToRemoteServerButton style={styles.button} />
        {settingsPropertiesEntries
          .filter(([, prop]) => !prop.isDisabled?.({ settings }))
          .map(([key, prop]) => (
            <VView key={key} style={styles.settingsItemWrapper}>
              <SettingsItem
                settings={settings}
                settingKey={key as keyof SettingsObject}
                prop={prop}
                onPropValueChange={onPropValueChange}
              />
            </VView>
          ))}
        <Card titleKey="app:testBluetoothDevices.title">
          {!isBtConnected && !connectedClassicDeviceId && !isBtScanning && (
            <Button
              icon="bluetooth"
              onPress={scanBt}
              textKey="app:testBluetoothDevices.scanAndConnect"
            />
          )}
          {(isBtConnected || !!connectedClassicDeviceId) && (
            <Button
              icon="bluetooth"
              onPress={disconnectSelectedBt}
              textKey="app:testBluetoothDevices.disconnect"
            />
          )}
          {btError && <Text>{btError}</Text>}
          {classicBtError && <Text>{classicBtError}</Text>}
        </Card>
        <Card titleKey="app:backup">
          <FullBackupButton />
        </Card>
        <Card
          contentStyle={styles.logsCardContent}
          titleKey="app:logs.title"
          subtitleKey="app:logs.subtitle"
        >
          <Button
            icon="download"
            onPress={onExportLogsPress}
            textKey="app:logs.exportLabel"
          />
          <Button
            icon="trash-can-outline"
            onPress={onClearLogsPress}
            textKey="app:logs.clear.label"
          />
        </Card>
      </VView>
    </ScreenView>
  );
};
