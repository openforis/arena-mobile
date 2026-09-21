import { useCallback, useState } from "react";

import { JobStatus } from "@openforis/arena-core";

import { useIsNetworkConnected } from "hooks";
import { SettingsModel } from "model";
import {
  AutoSyncSelectors,
  AutoSyncStatus,
  DataEntryActions,
  RemoteConnectionSelectors,
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

// deliberately avoids the plain "alert" (triangle) and "alert-circle" glyphs used by
// NodeValidationIcon for record validation errors/warnings - this icon sits right next to those
// in the record editor app bar, so reusing that glyph here read as another validation warning
// rather than a sync status
const iconByStatus: Record<AutoSyncStatus, { color: string; source: string }> = {
  [AutoSyncStatus.unchecked]: { color: "darkgrey", source: "cloud-question" },
  [AutoSyncStatus.synced]: { color: "green", source: "check-circle" },
  [AutoSyncStatus.pending]: { color: "orange", source: "cloud-upload-outline" },
  [AutoSyncStatus.error]: { color: "red", source: "sync-alert" },
  // not normally read (the authProblem override below takes over first) - kept for type safety
  // and as a defensive fallback
  [AutoSyncStatus.authError]: { color: "red", source: "account-alert" },
  // a check ran but failed (e.g. a server error) - see AutoSyncActions.checkError
  [AutoSyncStatus.checkError]: { color: "red", source: "cloud-alert" },
};

export type AutoSyncConnectionIssue = "offline" | "authError" | null;

// reasons auto-sync can't even attempt to run right now (see useAutoSyncMonitor's canAutoSync
// and runAutoSync's own guards) - shown instead of the regular status so the user knows to fix
// the connection/session rather than wait for something that isn't going to happen on its own.
// !user covers "never logged in" proactively; status === authError covers a session that was
// still considered valid locally but got rejected by the server on the last attempt.
// Meaningless while auto-sync itself is off (see computeIconAndColor's own "disabled always
// wins" note).
const computeConnectionIssue = ({
  autoSyncEnabled,
  networkConnected,
  user,
  status,
}: {
  autoSyncEnabled: boolean;
  networkConnected: boolean;
  user: any;
  status: AutoSyncStatus;
}): AutoSyncConnectionIssue => {
  if (!autoSyncEnabled) return null;
  if (!networkConnected) return "offline";
  if (!user || status === AutoSyncStatus.authError) return "authError";
  return null;
};

// "disabled" always wins: a manual check/send can still happen while auto-sync is off, but the
// icon's job here is to reflect the auto-sync setting itself, not that unrelated activity. Next,
// a connection issue (see computeConnectionIssue) wins over the regular per-record status, since
// it's what's actually blocking any sync attempt right now.
const computeIconAndColor = ({
  autoSyncEnabled,
  connectionIssue,
  status,
}: {
  autoSyncEnabled: boolean;
  connectionIssue: AutoSyncConnectionIssue;
  status: AutoSyncStatus;
}): { source: string; color: string } => {
  if (!autoSyncEnabled) return { source: "sync-off", color: "darkgrey" };
  if (connectionIssue === "offline") return { source: "cloud-off-outline", color: "darkgrey" };
  if (connectionIssue === "authError") return { source: "account-alert", color: "red" };
  return iconByStatus[status];
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
  const { checking, status, message } = AutoSyncSelectors.useAutoSyncState();
  const {
    isOpen,
    silent,
    progressPercent: jobProgressPercent,
    combinedProgressPercent,
    status: jobStatus,
    titleKey: jobTitleKey,
    cancel,
  } = useJobMonitor();
  const networkConnected = useIsNetworkConnected();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const uploading = isOpen && silent;
  const syncing = checking || uploading;
  const hasProgress =
    uploading && typeof jobProgressPercent === "number" && jobProgressPercent >= 0;
  // the zip preparation, upload and server-side processing phases are chained into one
  // continuous 0-100% bar (see REMOTE_UPLOAD_CHAIN_PROGRESS_RANGES in actionsDataExport.ts and
  // JobMonitorState.progressRangeStart/End) instead of each phase's own progress, which would
  // otherwise restart the bar from 0% up to three times in a row
  const progressPercent = combinedProgressPercent;
  // the zip preparation and upload/processing phases are all backed by a cancelable job; the
  // initial local "check what's out of sync" phase (checking, no job yet) is not
  const canCancel =
    uploading && [JobStatus.pending, JobStatus.running].includes(jobStatus);

  const connectionIssue = computeConnectionIssue({
    autoSyncEnabled,
    networkConnected,
    user,
    status,
  });

  // one tick of the same background check+upload logic, triggered on demand instead of waiting
  // for the next scheduled tick (or for auto-sync to even be on) - shared by "Try again" (a
  // failed check) and "Sync now" (records are known to be pending) below
  const triggerSync = useCallback(() => {
    dispatch(DataEntryActions.runAutoSync({ ignoreOpenRecordIdleThreshold: true }));
  }, [dispatch]);

  // a failed check stops retrying on its own (see useRecordsList.checkAutoSyncStatusIfNeeded and
  // runAutoSync's own guard for authError) - offer an explicit way to try again from here, the
  // one place every screen that shows this status also lets the user act on it. Meaningless
  // while auto-sync itself is off, same as the error text it goes with (see AutoSyncStatusDialog)
  const canRetry = autoSyncEnabled && status === AutoSyncStatus.checkError;
  const onRetry = triggerSync;

  // records are known to be waiting (a prior check found some), and nothing is running right
  // now - let the user send them immediately rather than wait for the next scheduled tick (or
  // for auto-sync to even be on: same as "Send data" elsewhere, this doesn't require it)
  const canSyncNow = !syncing && status === AutoSyncStatus.pending;
  const onSyncNow = triggerSync;

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

  // only the non-syncing appearance is decided here - each trigger component renders its own
  // spinner for `syncing`, since how to do that without blocking its own onPress differs: our
  // app IconButton's `loading` prop disables press, react-native-paper's Appbar.Action doesn't.
  const { source: icon, color } = computeIconAndColor({
    autoSyncEnabled,
    connectionIssue,
    status,
  });

  return {
    autoSyncEnabled,
    canCancel,
    canRetry,
    canSyncNow,
    closeDialog,
    color,
    connectionIssue,
    dialogVisible,
    hasProgress,
    icon,
    jobTitleKey,
    message,
    onAutoSyncEnabledChange,
    onCancel: cancel,
    onRetry,
    onSyncNow,
    openDialog,
    progressPercent,
    status,
    syncing,
  };
};
