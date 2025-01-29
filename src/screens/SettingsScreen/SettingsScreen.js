import { useState } from "react";
import { useDispatch } from "react-redux";

import { Objects } from "@openforis/arena-core";

import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
import { FullBackupButton } from "appComponents/FullBackupButton";
import { Card, ScreenView, VView } from "components";
import { SettingsModel } from "model";
import { SettingsActions, SettingsSelectors } from "state";

import { SettingsItem } from "./SettingsItem";
import styles from "./styles";

const settingsPropertiesEntries = Object.entries(SettingsModel.properties);

export const SettingsScreen = () => {
  const dispatch = useDispatch();

  const settingsStored = SettingsSelectors.useSettings();

  const [state, setState] = useState({ settings: settingsStored });

  const { settings } = state;

  const onPropValueChange =
    ({ key }) =>
    (value) => {
      dispatch(SettingsActions.updateSetting({ key, value }));
      setState((statePrev) =>
        Objects.assocPath({ obj: statePrev, path: ["settings", key], value })
      );
    };

  return (
    <ScreenView>
      <VView style={styles.settingsWrapper}>
        <ConnectionToRemoteServerButton style={styles.button} />

        {settingsPropertiesEntries
          .filter(([, prop]) => !prop.isDisabled?.())
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
      </VView>
    </ScreenView>
  );
};
