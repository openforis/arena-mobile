import { useCallback, useState } from "react";

import { SettingsModel } from "model";
import {
  AutoSyncSelectors,
  AutoSyncStatus,
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

const iconByStatus: Record<AutoSyncStatus, { color: string; source: string }> = {
  [AutoSyncStatus.unchecked]: { color: "darkgrey", source: "cloud-question" },
  [AutoSyncStatus.synced]: { color: "green", source: "check-circle" },
  [AutoSyncStatus.pending]: { color: "orange", source: "alert" },
  [AutoSyncStatus.error]: { color: "red", source: "alert-circle" },
};

/**
 * Shared logic behind every auto-sync status trigger (RecordsList icon, RecordEditor app bar
 * action, ...): the icon/color to show, whether a check/upload is in flight (and its progress,
 * if any), and the dialog open/close state + the auto-sync on/off toggle. Each caller renders
 * its own trigger element (IconButton, Appbar.Action, ...) plus the shared AutoSyncStatusDialog.
 */
export const useAutoSyncStatus = () => {
  const dispatch = useAppDispatch();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  const { checking, status } = AutoSyncSelectors.useAutoSyncState();
  const { isOpen, silent, progressPercent } = useJobMonitor();
  const uploading = isOpen && silent;
  const syncing = checking || uploading;
  const hasProgress =
    uploading && typeof progressPercent === "number" && progressPercent >= 0;

  const [dialogVisible, setDialogVisible] = useState(false);
  const openDialog = useCallback(() => setDialogVisible(true), []);
  const closeDialog = useCallback(() => setDialogVisible(false), []);

  const onAutoSyncEnabledChange = useCallback(() => {
    dispatch(
      SettingsActions.updateSetting({
        key: SettingsModel.SettingKey.autoSyncEnabled,
        value: !autoSyncEnabled,
      }),
    );
  }, [dispatch, autoSyncEnabled]);

  // "disabled" always wins: a manual check/send can still happen while auto-sync is off, but
  // the icon's job here is to reflect the auto-sync setting itself, not that unrelated activity.
  // Only the non-syncing appearance is decided here - each trigger component renders its own
  // spinner for `syncing`, since how to do that without blocking its own onPress differs: our
  // app IconButton's `loading` prop disables press, react-native-paper's Appbar.Action doesn't.
  const { source: icon, color } = !autoSyncEnabled
    ? { source: "sync-off", color: "darkgrey" }
    : iconByStatus[status];

  return {
    autoSyncEnabled,
    closeDialog,
    color,
    dialogVisible,
    hasProgress,
    icon,
    onAutoSyncEnabledChange,
    openDialog,
    progressPercent,
    status,
    syncing,
  };
};
