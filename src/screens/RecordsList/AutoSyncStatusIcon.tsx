import { Icon, LoadingIcon, Tooltip } from "components";
import { AutoSyncSelectors, AutoSyncStatus, SettingsSelectors } from "state";
import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

const iconByStatus: Record<AutoSyncStatus, { color: string; source: string }> = {
  [AutoSyncStatus.unchecked]: { color: "darkgrey", source: "cloud-question" },
  [AutoSyncStatus.synced]: { color: "green", source: "check-circle" },
  [AutoSyncStatus.pending]: { color: "orange", source: "alert" },
  [AutoSyncStatus.error]: { color: "red", source: "alert-circle" },
};

const tooltipKeyByStatus: Record<AutoSyncStatus, string> = {
  [AutoSyncStatus.unchecked]: "dataEntry:autoSync.status.uncheckedTooltip",
  [AutoSyncStatus.synced]: "dataEntry:autoSync.status.syncedTooltip",
  [AutoSyncStatus.pending]: "dataEntry:autoSync.status.pendingTooltip",
  [AutoSyncStatus.error]: "dataEntry:autoSync.status.errorTooltip",
};

/**
 * Self-contained: reads the shared auto-sync status from redux (state/autoSync), so it can be
 * dropped into any screen with no props, rather than each screen fetching/deriving it itself.
 * Renders nothing when the "Auto sync" setting is off.
 */
export const AutoSyncStatusIcon = () => {
  const { autoSyncEnabled } = SettingsSelectors.useSettings();
  const { checking, status } = AutoSyncSelectors.useAutoSyncState();
  const { isOpen, silent, progressPercent } = useJobMonitor();
  const uploading = isOpen && silent;

  if (!autoSyncEnabled) return null;

  if (checking || uploading) {
    const hasProgress =
      uploading && typeof progressPercent === "number" && progressPercent >= 0;
    return (
      <Tooltip
        titleKey={
          hasProgress
            ? "dataEntry:autoSync.status.syncingTooltipWithProgress"
            : "dataEntry:autoSync.status.syncingTooltip"
        }
        titleParams={hasProgress ? { progressPercent } : undefined}
      >
        <LoadingIcon />
      </Tooltip>
    );
  }

  const { color, source } = iconByStatus[status];
  return (
    <Tooltip titleKey={tooltipKeyByStatus[status]}>
      <Icon color={color} size={24} source={source} />
    </Tooltip>
  );
};
