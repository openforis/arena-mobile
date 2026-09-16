import { StyleSheet } from "react-native";

import { Checkbox, Dialog, ProgressBar, Text, VView } from "components";
import { AutoSyncStatus } from "state";
import { AutoSyncConnectionIssue } from "./useAutoSyncStatus";

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
  // not normally read (a connectionIssue takes over first when this status is set) - kept for
  // type safety and as a defensive fallback
  [AutoSyncStatus.authError]: "dataEntry:autoSync.status.authErrorTooltip",
  [AutoSyncStatus.checkError]: "dataEntry:autoSync.status.checkErrorTooltip",
};

const textKeyByConnectionIssue: Record<
  Exclude<AutoSyncConnectionIssue, null>,
  string
> = {
  offline: "dataEntry:autoSync.status.offlineTooltip",
  authError: "dataEntry:autoSync.status.authErrorTooltip",
};

type Props = {
  autoSyncEnabled: boolean;
  canCancel: boolean;
  canRetry: boolean;
  connectionIssue: AutoSyncConnectionIssue;
  hasProgress: boolean;
  onAutoSyncEnabledChange: () => void;
  onCancel: () => void;
  onClose: () => void;
  onRetry: () => void;
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
    canCancel,
    canRetry,
    connectionIssue,
    hasProgress,
    onAutoSyncEnabledChange,
    onCancel,
    onClose,
    onRetry,
    progressPercent,
    status,
    syncing,
    visible,
  } = props;

  const statusTextKey = connectionIssue
    ? textKeyByConnectionIssue[connectionIssue]
    : statusTextKeyByStatus[status];

  const actions = [
    ...(canCancel ? [{ onPress: onCancel, textKey: "common:cancel" }] : []),
    ...(canRetry ? [{ onPress: onRetry, textKey: "common:tryAgain" }] : []),
  ];

  return (
    <Dialog
      actions={actions}
      onClose={onClose}
      showActions={actions.length > 0}
      showCloseButton
      title="dataEntry:autoSync.checkbox"
      visible={visible}
    >
      <VView style={styles.content} transparent>
        <Checkbox
          checked={autoSyncEnabled}
          label="dataEntry:autoSync.checkbox"
          onPress={onAutoSyncEnabledChange}
        />
        <Text textKey={statusTextKey} />
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
