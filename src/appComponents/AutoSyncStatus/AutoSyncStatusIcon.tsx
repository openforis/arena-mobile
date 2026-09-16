import { IconButton, LoadingIcon } from "components";

import { AutoSyncStatusDialog } from "./AutoSyncStatusDialog";
import { useAutoSyncStatus } from "./useAutoSyncStatus";

/**
 * Self-contained: reads the shared auto-sync status from redux (state/autoSync), so it can be
 * dropped into any screen with no props, rather than each screen fetching/deriving it itself.
 * Pressing it opens a dialog to enable/disable auto-sync and, while a check or upload is
 * actually in flight, see its progress.
 */
export const AutoSyncStatusIcon = () => {
  const {
    autoSyncEnabled,
    canCancel,
    canRetry,
    closeDialog,
    color,
    connectionIssue,
    dialogVisible,
    hasProgress,
    icon,
    onAutoSyncEnabledChange,
    onCancel,
    onRetry,
    openDialog,
    progressPercent,
    status,
    syncing,
  } = useAutoSyncStatus();

  // rendered as the icon itself, not via IconButton's own `loading` prop: that prop disables
  // onPress, which would block opening the dialog right when the user most wants to check
  // progress in it
  const iconOrSpinner = syncing ? () => <LoadingIcon /> : icon;

  return (
    <>
      <IconButton icon={iconOrSpinner} iconColor={color} onPress={openDialog} />
      <AutoSyncStatusDialog
        autoSyncEnabled={autoSyncEnabled}
        canCancel={canCancel}
        canRetry={canRetry}
        connectionIssue={connectionIssue}
        hasProgress={hasProgress}
        onAutoSyncEnabledChange={onAutoSyncEnabledChange}
        onCancel={onCancel}
        onClose={closeDialog}
        onRetry={onRetry}
        progressPercent={progressPercent}
        status={status}
        syncing={syncing}
        visible={dialogVisible}
      />
    </>
  );
};
