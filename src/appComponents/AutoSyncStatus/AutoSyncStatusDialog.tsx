import { useEffect } from "react";
import { StyleSheet } from "react-native";

import { Checkbox, Dialog, ProgressBar, Text, VView } from "components";
import { AutoSyncActions, AutoSyncStatus, useAppDispatch } from "state";
import { useAutoSyncStatus } from "./useAutoSyncStatus";

const styles = StyleSheet.create({
  // fixed height: the content (status text, message, progress) changes often while syncing,
  // which would otherwise resize the dialog continuously
  dialog: {
    height: 420,
  },
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

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!visible) return undefined;
    dispatch(AutoSyncActions.setDialogOpen(true));
    return () => {
      dispatch(AutoSyncActions.setDialogOpen(false));
    };
  }, [dispatch, visible]);

  const {
    autoSyncEnabled,
    canCancel,
    canRetry,
    canSyncNow,
    conflictingKeysWithMergeNotAllowed,
    connectionIssue,
    hasProgress,
    jobTitleKey,
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
  const showStatusText = autoSyncEnabled && !isStaleErrorStatus;
  const statusTextKey = `dataEntry:autoSync.status.${connectionIssue ?? status}Tooltip`;
  // stale/contradictory otherwise: message is set as a specific outcome of a check that already
  // completed, so it doesn't apply once a live connection issue is overriding the status, a new
  // check/sync is already underway, or the status itself already says records are pending/erroring
  // (e.g. a record created less than a minute ago is "pending" but not yet an upload candidate,
  // which would otherwise show this "nothing to send" note right next to "records need syncing")
  const showMessage =
    showStatusText &&
    !!message &&
    !connectionIssue &&
    !syncing &&
    status !== AutoSyncStatus.pending &&
    status !== AutoSyncStatus.error &&
    status !== AutoSyncStatus.needsManualFix;

  // the generic needsManualFix text can't tell whether the user can fix the records themselves:
  // records with the same key(s) as one on the server may really be the same record, which only
  // the survey administrator can let them merge
  const showMergeNotAllowedNote =
    showStatusText &&
    !connectionIssue &&
    status === AutoSyncStatus.needsManualFix &&
    conflictingKeysWithMergeNotAllowed;

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
      style={styles.dialog}
      title="dataEntry:autoSync.statusTitle"
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
        {showMergeNotAllowedNote && (
          <Text
            style={styles.note}
            textKey="dataEntry:autoSync.status.mergeWithSameKeysNotAllowedNote"
            variant="bodySmall"
          />
        )}
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
                // while a job backs the progress (zip preparation, upload, then server-side
                // processing - see useAutoSyncStatus), each phase's own title replaces the
                // generic "synchronizing" text: they're separate jobs, but chained into one
                // continuous progress bar below (see REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES), so the
                // changing title is what tells the user a new step started, not a bar reset
                hasProgress && jobTitleKey
                  ? jobTitleKey
                  : "dataEntry:autoSync.status.syncingTooltip"
              }
            />
            {hasProgress && (
              <Text
                style={styles.note}
                textKey="dataEntry:autoSync.status.progressPercent"
                textParams={{ progressPercent: Math.round(progressPercent) }}
                variant="bodySmall"
              />
            )}
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
