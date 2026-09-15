import { StyleSheet } from "react-native";

import { Checkbox, Dialog, ProgressBar, Text, VView } from "components";
import { AutoSyncStatus } from "state";

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  progress: {
    gap: 4,
  },
});

const statusTextKeyByStatus: Record<AutoSyncStatus, string> = {
  [AutoSyncStatus.unchecked]: "dataEntry:autoSync.status.uncheckedTooltip",
  [AutoSyncStatus.synced]: "dataEntry:autoSync.status.syncedTooltip",
  [AutoSyncStatus.pending]: "dataEntry:autoSync.status.pendingTooltip",
  [AutoSyncStatus.error]: "dataEntry:autoSync.status.errorTooltip",
};

type Props = {
  autoSyncEnabled: boolean;
  hasProgress: boolean;
  onAutoSyncEnabledChange: () => void;
  onClose: () => void;
  progressPercent: number;
  status: AutoSyncStatus;
  syncing: boolean;
  visible: boolean;
};

// shared by every auto-sync status trigger (RecordsList icon, RecordEditor app bar action, ...)
// - see useAutoSyncStatus for the state/logic feeding this
export const AutoSyncStatusDialog = (props: Props) => {
  const {
    autoSyncEnabled,
    hasProgress,
    onAutoSyncEnabledChange,
    onClose,
    progressPercent,
    status,
    syncing,
    visible,
  } = props;

  return (
    <Dialog
      onClose={onClose}
      showActions={false}
      title="dataEntry:autoSync.checkbox"
      visible={visible}
    >
      <VView style={styles.content} transparent>
        <Checkbox
          checked={autoSyncEnabled}
          label="dataEntry:autoSync.checkbox"
          onPress={onAutoSyncEnabledChange}
        />
        <Text textKey={statusTextKeyByStatus[status]} />
        {syncing && (
          <VView style={styles.progress} transparent>
            <Text
              textKey={
                hasProgress
                  ? "dataEntry:autoSync.status.syncingTooltipWithProgress"
                  : "dataEntry:autoSync.status.syncingTooltip"
              }
              textParams={hasProgress ? { progressPercent } : undefined}
            />
            <ProgressBar
              indeterminate={!hasProgress}
              progress={hasProgress ? progressPercent / 100 : undefined}
            />
          </VView>
        )}
      </VView>
    </Dialog>
  );
};
