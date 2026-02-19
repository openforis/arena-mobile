import { useCallback, useEffect, useState } from "react";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";

import { Button, Card, ScreenView, Text, VView } from "components";
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

import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

export const SettingsScreen = () => {
  log.debug(`rendering SettingsScreen`);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const {
    disconnectBt,
    isBtConnected,
    scanBtAndConnect,
    btError,
    btConnectedDevices,
  } = useBLE<any>({
    // serviceUUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    characteristicUUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    deviceFilter: (device) =>
      ["TruPulse", "Garmin"].some(
        (name) => device.name?.includes(name) ?? false,
      ),
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
          {!isBtConnected && (
            <Button
              icon="bluetooth"
              onPress={scanBtAndConnect}
              textKey="app:testBluetoothDevices.scanAndConnect"
            />
          )}
          {isBtConnected && (
            <Button
              icon="bluetooth"
              onPress={disconnectBt}
              textKey="app:testBluetoothDevices.disconnect"
            />
          )}
          {btError && <Text>{btError}</Text>}
          {btConnectedDevices.length > 0 && (
            <Text>{`Connected devices: ${btConnectedDevices
              .map((d) => d.device.name)
              .join(", ")}`}</Text>
          )}
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
