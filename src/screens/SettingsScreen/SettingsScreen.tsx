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
    ({
      key
    }: any) =>
    (value: any) => {
      const oldValue = settings[key];
      if (value === oldValue) return;
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
      dispatch(SettingsActions.updateSetting({ key, value }));
      setState((statePrev) =>
        Objects.assocPath({ obj: statePrev, path: ["settings", key], value })
      );
    };

  return (
    // @ts-expect-error TS(2786): 'ScreenView' cannot be used as a JSX component.
    <ScreenView>
      <VView style={styles.settingsWrapper}>
        <ConnectionToRemoteServerButton style={styles.button} />

        {settingsPropertiesEntries
          // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type '{ ty... Remove this comment to see the full error message
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

        // @ts-expect-error TS(2786): 'Card' cannot be used as a JSX component.
        <Card titleKey="app:backup">
          <FullBackupButton />
        </Card>
      </VView>
    </ScreenView>
  );
};
