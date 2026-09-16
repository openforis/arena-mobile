import { StyleSheet } from "react-native";

import { Checkbox, Dialog, ProgressBar, Text, VView } from "components";
import { AutoSyncStatus } from "state";
import { AutoSyncConnectionIssue, useAutoSyncStatus } from "./useAutoSyncStatus";

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  progress: {
    gap: 4,
  },
  note: {
    opacity: 0.7,
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
  // open/close state is owned by whichever trigger (RecordsList icon, RecordEditor app bar
  // action, ...) renders this dialog, since each one keeps its own - everything else about
  // what's inside is fetched here directly from useAutoSyncStatus
  onClose: () => void;
  visible: boolean;
};

// shared by every auto-sync status trigger (RecordsList icon, RecordEditor app bar action, ...)
// - see useAutoSyncStatus for the state/logic feeding this
export const AutoSyncStatusDialog = (props: Props) => {
  const { onClose, visible } = props;

  const {
    autoSyncEnabled,
    canCancel,
    canRetry,
    canSyncNow,
    connectionIssue,
    hasProgress,
    message,
    onAutoSyncEnabledChange,
    onCancel,
    onRetry,
    onSyncNow,
    progressPercent,
    status,
    syncing,
  } = useAutoSyncStatus();

  // checkError/authError describe a background check that failed - once auto-sync is off,
  // nothing is retrying in the background any more, so keeping that error (and its "Try again"
  // action, see canRetry) on screen would be stale and actionable for no reason
  const isStaleErrorStatus =
    !autoSyncEnabled &&
    (status === AutoSyncStatus.checkError || status === AutoSyncStatus.authError);
  const showStatusText = !isStaleErrorStatus;
  const statusTextKey = connectionIssue
    ? textKeyByConnectionIssue[connectionIssue]
    : statusTextKeyByStatus[status];
  // stale otherwise: message is set as a specific outcome of a check that already completed, so
  // it doesn't apply once a live connection issue is overriding the status, or a new check/sync
  // is already underway
  const showMessage = showStatusText && !!message && !connectionIssue && !syncing;

  const actions = [
    ...(canCancel ? [{ onPress: onCancel, textKey: "common:cancel" }] : []),
    ...(canRetry ? [{ onPress: onRetry, textKey: "common:tryAgain" }] : []),
    ...(canSyncNow ? [{ onPress: onSyncNow, textKey: "dataEntry:autoSync.syncNow" }] : []),
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
          disabled={syncing}
          label="dataEntry:autoSync.checkbox"
          onPress={onAutoSyncEnabledChange}
        />
        <Text
          style={styles.note}
          textKey="dataEntry:autoSync.batteryDataWarning"
          variant="bodySmall"
        />
        {showStatusText && <Text textKey={statusTextKey} />}
        {showMessage && (
          <Text
            style={styles.note}
            textKey={message!.textKey}
            textParams={message!.textParams}
            variant="bodySmall"
          />
        )}
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
