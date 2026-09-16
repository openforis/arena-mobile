import { Appbar as RNPAppbar } from "react-native-paper";

import { AutoSyncStatusDialog } from "./AutoSyncStatusDialog";
import { useAutoSyncStatus } from "./useAutoSyncStatus";

/**
 * Same auto-sync status control as AutoSyncStatusIcon, styled as an Appbar.Action for use in
 * a screen's top app bar (e.g. the RecordEditor header) rather than a plain icon button.
 */
export const AutoSyncStatusAppBarAction = () => {
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

  return (
    <>
      <RNPAppbar.Action
        color={color}
        icon={icon}
        loading={syncing}
        onPress={openDialog}
      />
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
