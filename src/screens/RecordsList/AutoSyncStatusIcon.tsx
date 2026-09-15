import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

import {
  Checkbox,
  Dialog,
  IconButton,
  LoadingIcon,
  ProgressBar,
  Text,
  VView,
} from "components";
import { SettingsModel } from "model";
import {
  AutoSyncSelectors,
  AutoSyncStatus,
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  progress: {
    gap: 4,
  },
});

const iconByStatus: Record<AutoSyncStatus, { color: string; source: string }> = {
  [AutoSyncStatus.unchecked]: { color: "darkgrey", source: "cloud-question" },
  [AutoSyncStatus.synced]: { color: "green", source: "check-circle" },
  [AutoSyncStatus.pending]: { color: "orange", source: "alert" },
  [AutoSyncStatus.error]: { color: "red", source: "alert-circle" },
};

const statusTextKeyByStatus: Record<AutoSyncStatus, string> = {
  [AutoSyncStatus.unchecked]: "dataEntry:autoSync.status.uncheckedTooltip",
  [AutoSyncStatus.synced]: "dataEntry:autoSync.status.syncedTooltip",
  [AutoSyncStatus.pending]: "dataEntry:autoSync.status.pendingTooltip",
  [AutoSyncStatus.error]: "dataEntry:autoSync.status.errorTooltip",
};

/**
 * Self-contained: reads the shared auto-sync status from redux (state/autoSync), so it can be
 * dropped into any screen with no props, rather than each screen fetching/deriving it itself.
 * Pressing it opens a dialog to enable/disable auto-sync and, while a check or upload is
 * actually in flight, see its progress.
 */
export const AutoSyncStatusIcon = () => {
  const dispatch = useAppDispatch();
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  const { checking, status } = AutoSyncSelectors.useAutoSyncState();
  const { isOpen, silent, progressPercent } = useJobMonitor();
  const uploading = isOpen && silent;
  const syncing = checking || uploading;

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

  const hasProgress =
    uploading && typeof progressPercent === "number" && progressPercent >= 0;

  // "disabled" always wins: a manual check/send can still happen while auto-sync is off, but
  // the icon's job here is to reflect the auto-sync setting itself, not that unrelated activity
  let icon: any;
  let color: string | undefined;
  if (!autoSyncEnabled) {
    icon = "sync-off";
    color = "darkgrey";
  } else if (syncing) {
    // rendered as the icon itself, not via IconButton's own `loading` prop: that prop disables
    // onPress, which would block opening the dialog right when the user most wants to check
    // progress in it
    icon = () => <LoadingIcon />;
  } else {
    ({ color, source: icon } = iconByStatus[status]);
  }

  return (
    <>
      <IconButton icon={icon} iconColor={color} onPress={openDialog} />
      <Dialog
        onClose={closeDialog}
        showActions={false}
        title="dataEntry:autoSync.checkbox"
        visible={dialogVisible}
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
    </>
  );
};
