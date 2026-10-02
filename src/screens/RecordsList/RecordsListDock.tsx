import { useCallback } from "react";
import { Surface } from "react-native-paper";

import { AutoSyncStatusIcon } from "appComponents/AutoSyncStatus";
import {
  Button,
  FlexWrapView,
  HView,
  MenuButton,
  Switch,
  Text,
} from "components";
import { SettingsModel } from "model";
import {
  SettingsActions,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import styles from "./styles";

type RecordsListDockProps = {
  downloadMenuItems: any[];
  // undefined when new records can't be created (e.g. a cycle other than the default one is selected)
  onNewRecordPress?: () => void;
  onSendDataPress: () => void;
  showRecordActions: boolean;
  showSendDataButton: boolean;
};

// everything about getting records to/from the server, plus the main record actions, grouped in
// a single elevated dock at the bottom of the screen (within thumb reach), in 3 columns:
// - "New" alone on the left, being the most important action
// - sync in the middle: auto-sync (status icon + on/off switch) and "Send data" only when it's
//   needed (auto-sync off, or auto-sync failing and needing a manual decision) - on the same
//   line when there's enough width, otherwise wrapped below it
// - the download menu (which also has "Check status") on the right
export const RecordsListDock = (props: RecordsListDockProps) => {
  const {
    downloadMenuItems,
    onNewRecordPress,
    onSendDataPress,
    showRecordActions,
    showSendDataButton,
  } = props;

  const dispatch = useAppDispatch();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  // records of the demo survey can't be sent to any server (see useAutoSyncMonitor)
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();

  const onAutoSyncEnabledChange = useCallback(() => {
    dispatch(
      SettingsActions.updateSetting({
        key: SettingsModel.SettingKey.autoSyncEnabled,
        value: !autoSyncEnabled,
      }),
    );
  }, [dispatch, autoSyncEnabled]);

  // nothing to show
  if (isDemoSurvey && !showRecordActions) return null;

  return (
    <Surface elevation={2} style={styles.dock}>
      <HView style={styles.dockRow} transparent>
        <HView style={styles.dockSide} transparent>
          {showRecordActions && onNewRecordPress && (
            <Button
              icon="plus"
              onPress={onNewRecordPress}
              style={styles.newRecordButton}
              textKey="dataEntry:newRecordShort"
            />
          )}
        </HView>
        {!isDemoSurvey && (
          <FlexWrapView style={styles.dockCenter} transparent>
            {showRecordActions && showSendDataButton && (
              <Button
                compact
                icon="cloud-upload"
                onPress={onSendDataPress}
                textKey="dataEntry:sendData"
              />
            )}
            <HView style={styles.autoSyncGroup} transparent>
              <AutoSyncStatusIcon />
              <Text
                onPress={onAutoSyncEnabledChange}
                style={styles.autoSyncLabel}
                textKey="dataEntry:autoSync.checkbox"
              />
              <Switch
                onChange={onAutoSyncEnabledChange}
                style={styles.autoSyncSwitch}
                value={autoSyncEnabled}
              />
            </HView>
          </FlexWrapView>
        )}
        <HView style={[styles.dockSide, styles.dockSideEnd]} transparent>
          {showRecordActions && (
            <MenuButton
              anchorPosition="top"
              icon="download"
              items={downloadMenuItems}
              menuStyle={styles.exportDataButtonMenu}
            />
          )}
        </HView>
      </HView>
    </Surface>
  );
};
