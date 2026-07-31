import { useCallback, useState } from "react";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";

import { Button, Card, FieldSet, ScreenView, VView } from "components";
import { SettingsModel, SettingsObject } from "model";
import { AppService } from "service/appService";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { log, clearLogs } from "utils";

import { GpsSourceSettingsField } from "./GpsSourceSettingsField";
import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

const settingGroupsOrder = [
  SettingsModel.SettingGroup.appearance,
  SettingsModel.SettingGroup.dataEntry,
  SettingsModel.SettingGroup.location,
  SettingsModel.SettingGroup.images,
];

const settingsEntriesByGroup = settingGroupsOrder.map((group) => ({
  group,
  entries: settingsPropertiesEntries.filter(([, prop]) => prop.group === group),
}));

export const SettingsScreen = () => {
  log.debug(`rendering SettingsScreen`);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

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
          Objects.assocPath({ obj: statePrev, path: ["settings", key], value })
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
        {settingsEntriesByGroup.map(({ group, entries }) => {
          const visibleEntries = entries.filter(
            ([, prop]) => !prop.isDisabled?.({ settings })
          );
          const isLocationGroup = group === SettingsModel.SettingGroup.location;
          if (visibleEntries.length === 0 && !isLocationGroup) return null;
          return (
            <FieldSet
              key={group}
              headerKey={`settings:group.${group}`}
              headerStyle={styles.settingsGroupHeader}
            >
              {visibleEntries.map(([key, prop]) => (
                <VView key={key} style={styles.settingsItemWrapper}>
                  <SettingsItem
                    settings={settings}
                    settingKey={key as keyof SettingsObject}
                    prop={prop}
                    onPropValueChange={onPropValueChange}
                  />
                </VView>
              ))}
              {isLocationGroup && (
                <VView style={styles.settingsItemWrapper}>
                  <GpsSourceSettingsField
                    value={settings.preferredGpsSourceId}
                  />
                </VView>
              )}
            </FieldSet>
          );
        })}
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
