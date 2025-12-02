import { useCallback, useState } from "react";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";
import { Button, Card, HView, ScreenView, VView } from "components";
import { SettingsModel } from "model";
import { AppService } from "service/appService";
import { SettingsActions, SettingsSelectors, useAppDispatch } from "state";
import { log, clearLogs } from "utils";

import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

export const SettingsScreen = () => {
  log.debug(`rendering SettingsScreen`);
  const dispatch = useAppDispatch();

  const settingsStored = SettingsSelectors.useSettings();

  const [state, setState] = useState({ settings: settingsStored });

  const { settings } = state;

  const onPropValueChange =
    ({ key }: any) =>
    async (value: any) => {
      const oldValue = settings[key];
      if (value === oldValue) return;
      dispatch(SettingsActions.updateSetting({ key, value }));
      setState((statePrev) =>
        Objects.assocPath({ obj: statePrev, path: ["settings", key], value })
      );
    };

  const onExportLogsPress = useCallback(async () => {
    await AppService.exportLogsAndShareThem();
  }, []);

  const onClearLogsPress = useCallback(async () => {
    await clearLogs();
  }, []);

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
                settingKey={key}
                prop={prop}
                onPropValueChange={onPropValueChange}
              />
            </VView>
          ))}
        <Card titleKey="app:backup">
          <FullBackupButton />
        </Card>
        <Card titleKey="app:logs.title">
          <HView>
            <Button
              onPress={onExportLogsPress}
              textKey="app:logs.exportLabel"
            />
            <Button onPress={onClearLogsPress} textKey="app:logs.clear" />
          </HView>
        </Card>
      </VView>
    </ScreenView>
  );
};
