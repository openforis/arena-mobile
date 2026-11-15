import React, { useMemo } from "react";

import { HView, Icon, Text, Tooltip } from "components";
import { RecordSyncStatus, ScreenViewMode } from "model";
import { ScreenOptionsSelectors } from "state/screenOptions";

import type { RecordListItem } from "./recordsVisualizerFields";

const colors = {
  red: "red",
  darkgrey: "darkgrey",
  yellow: "yellow",
  green: "green",
};

const colorBySyncStatus = {
  [RecordSyncStatus.keysNotSpecified]: colors.red,
  [RecordSyncStatus.conflictingKeys]: colors.red,
  [RecordSyncStatus.deviceDateBehindServer]: colors.red,
  [RecordSyncStatus.new]: colors.darkgrey,
  [RecordSyncStatus.modifiedLocally]: colors.yellow,
  [RecordSyncStatus.modifiedLocallyAndRemotely]: colors.red,
  [RecordSyncStatus.modifiedRemotely]: colors.red,
  [RecordSyncStatus.notInEntryStepAnymore]: colors.red,
  [RecordSyncStatus.notModified]: colors.green,
  [RecordSyncStatus.notUpToDate]: colors.yellow,
};

// also used in the legend, with an item having only the sync status
type Props = {
  alwaysShowLabel?: boolean;
  item: Pick<RecordListItem, "syncStatus">;
  viewMode?: ScreenViewMode;
};

export const RecordSyncStatusIcon = (props: Props) => {
  const { item, alwaysShowLabel = false } = props;
  const { syncStatus } = item;

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsList = alwaysShowLabel || screenViewMode === ScreenViewMode.list;

  const iconColor = syncStatus ? colorBySyncStatus[syncStatus] : undefined;

  const icon = useMemo(
    () => <Icon color={iconColor} size={24} source="circle" />,
    [iconColor],
  );

  if (!syncStatus || syncStatus === RecordSyncStatus.syncNotApplicable)
    return null;

  const textKey = `dataEntry:syncStatus.${syncStatus}`;

  return viewAsList ? (
    <HView>
      {icon}
      <Text textKey={textKey} />
    </HView>
  ) : (
    <Tooltip titleKey={textKey}>{icon}</Tooltip>
  );
};
