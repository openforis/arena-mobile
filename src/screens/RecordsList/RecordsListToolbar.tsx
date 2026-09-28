import { useCallback } from "react";
import { Checkbox as RNPCheckbox } from "react-native-paper";

import {
  Button,
  FlexWrapView,
  HView,
  SegmentedButtons,
  Text,
} from "components";
import { useIsNetworkConnected } from "hooks";
import { SettingsModel } from "model";
import {
  SettingsActions,
  SettingsSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import styles from "./styles";

enum RecordsType {
  local = "local",
  all = "all",
}

const recordTypeButtons = Object.values(RecordsType).map((recordType) => ({
  value: recordType,
  label: `recordsList:recordType.${recordType}`,
}));

type RecordsListToolbarProps = {
  onlyLocal?: boolean;
  onOnlyLocalChange: (value: boolean) => void;
  onRemoteSyncPress: () => void;
  syncStatusLoading?: boolean;
};

// the controls used most often while browsing records (which records to show, their sync
// status), kept always visible right above the records table instead of inside the collapsible
// RecordsListOptions panel
export const RecordsListToolbar = (props: RecordsListToolbarProps) => {
  const { onlyLocal, onOnlyLocalChange, onRemoteSyncPress, syncStatusLoading } =
    props;

  const dispatch = useAppDispatch();
  const networkAvailable = useIsNetworkConnected();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  // records of the demo survey can't be sent to any server (see useAutoSyncMonitor)
  const isDemoSurvey = SurveySelectors.useIsCurrentSurveyDemo();

  const recordsType = onlyLocal ? RecordsType.local : RecordsType.all;

  const onRecordsTypeChange = useCallback(
    (value: string) => {
      onOnlyLocalChange(value === RecordsType.local);
    },
    [onOnlyLocalChange],
  );

  const onAutoSyncEnabledChange = useCallback(() => {
    dispatch(
      SettingsActions.updateSetting({
        key: SettingsModel.SettingKey.autoSyncEnabled,
        value: !autoSyncEnabled,
      }),
    );
  }, [dispatch, autoSyncEnabled]);

  return (
    <FlexWrapView style={styles.toolbar}>
      <SegmentedButtons
        buttons={recordTypeButtons}
        onChange={onRecordsTypeChange}
        value={recordsType}
      />
      <Button
        color="secondary"
        disabled={!networkAvailable}
        icon="cloud-refresh"
        loading={syncStatusLoading}
        onPress={onRemoteSyncPress}
        textKey="dataEntry:checkStatus"
      />
      {!isDemoSurvey && (
        // not the shared Checkbox (react-native-paper's Checkbox.Item): that's meant as a
        // full-width list row, and sized to its content inside this wrapping row its label got
        // clipped on Android - a plain checkbox + content-sized label doesn't have that problem
        <HView style={styles.autoSyncCheckbox}>
          <RNPCheckbox.Android
            onPress={onAutoSyncEnabledChange}
            status={autoSyncEnabled ? "checked" : "unchecked"}
          />
          <Text
            onPress={onAutoSyncEnabledChange}
            textKey="dataEntry:autoSync.checkbox"
          />
        </HView>
      )}
    </FlexWrapView>
  );
};
