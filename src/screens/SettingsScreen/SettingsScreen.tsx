import { useState } from "react";
import { useDispatch } from "react-redux";

import { Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'appComponents/ConnectionToRemo... Remove this comment to see the full error message
import { ConnectionToRemoteServerButton } from "appComponents/ConnectionToRemoteServerButton";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/FullBackupButton... Remove this comment to see the full error message
import { FullBackupButton } from "appComponents/FullBackupButton";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Card, ScreenView, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { SettingsModel } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
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
      </VView>
    </ScreenView>
  );
};
