import { useCallback, useEffect, useState } from "react";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";

import { Button, Card, ScreenView, Text, VView } from "components";
import { useBluetoothDeviceLookup } from "hooks/useBluetoothDeviceLookup";
import { useBLE } from "hooks";
import { SettingsModel, SettingsObject } from "model";
import { AppService } from "service/appService";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log, clearLogs } from "utils";
import { bluetoothClassicConnector } from "utils/BluetoothClassicConnector";
import { BluetoothDeviceKind } from "utils/BluetoothScanner";

import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

export const SettingsScreen = () => {
  log.debug(`rendering SettingsScreen`);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [connectedClassicDeviceId, setConnectedClassicDeviceId] = useState<
    string | null
  >(null);
  const [classicBtError, setClassicBtError] = useState<string | null>(null);
  const { error, scanning, lookupDevice } = useBluetoothDeviceLookup();

  const onBtRawData = useCallback((raw: string) => {
    log.debug(`Received BT data: ${raw}`);
  }, []);

  const { disconnectBt, isBtConnected, connectBt, btError } = useBLE<any>({
    // serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    // characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    // deviceFilter: (device) =>
    //   ["TruPulse", "Garmin"].some(
    //     (name) => device.name?.includes(name) ?? false,
    //   ),
    onRawData: (raw) => {
      onBtRawData(raw);
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
      bluetoothClassicConnector.disconnect().catch((error: unknown) => {
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
    const device = await lookupDevice({
      filterFn: (device) => !!device.name && device.name !== device.id,
    });
    if (!device) return;

    const { id: deviceId, kind } = device!;
    if (kind === BluetoothDeviceKind.ble) {
      await bluetoothClassicConnector.disconnect();
      setConnectedClassicDeviceId(null);
      await connectBt({
        deviceId,
        serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
        characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
      });
    } else {
      log.debug(`Connecting to classic BT device ${deviceId}...`);
      await disconnectBt();
      const classicDevice = await bluetoothClassicConnector.connect({
        deviceId,
        onRawData: onBtRawData,
      });
      setConnectedClassicDeviceId(classicDevice.id);
    }
  }, [connectBt, disconnectBt, lookupDevice, onBtRawData]);

  const disconnectSelectedBt = useCallback(async () => {
    log.debug(`Disconnecting from selected Bluetooth device...`);
    log.debug(
      `Currently connected classic device ID: ${connectedClassicDeviceId}`,
    );
    if (connectedClassicDeviceId) {
      try {
        await bluetoothClassicConnector.disconnect(connectedClassicDeviceId);
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
          {!isBtConnected && !connectedClassicDeviceId && !scanning && (
            <Button
              icon="bluetooth"
              onPress={scanBt}
              textKey="app:testBluetoothDevices.scanAndConnect"
            />
          )}
          {(scanning || isBtConnected || !!connectedClassicDeviceId) && (
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
