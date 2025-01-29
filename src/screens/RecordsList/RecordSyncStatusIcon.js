import React, { useMemo } from "react";

import {
  DataVisualizerCellPropTypes,
  HView,
  Icon,
  Text,
  Tooltip,
} from "components";
import { RecordSyncStatus, ScreenViewMode } from "model";
import { ScreenOptionsSelectors } from "state/screenOptions";

const colors = {
  red: "red",
  darkgrey: "darkgrey",
  yellow: "yellow",
  green: "green",
};

const colorBySyncStatus = {
  [RecordSyncStatus.keysNotSpecified]: colors.red,
  [RecordSyncStatus.conflictingKeys]: colors.red,
  [RecordSyncStatus.new]: colors.darkgrey,
  [RecordSyncStatus.modifiedLocally]: colors.yellow,
  [RecordSyncStatus.modifiedRemotely]: colors.red,
  [RecordSyncStatus.notInEntryStepAnymore]: colors.red,
  [RecordSyncStatus.notModified]: colors.green,
  [RecordSyncStatus.notUpToDate]: colors.yellow,
};

export const RecordSyncStatusIcon = (props) => {
  const { item } = props;
  const { syncStatus } = item;

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsList = screenViewMode === ScreenViewMode.list;

  const iconColor = colorBySyncStatus[syncStatus];

  const icon = useMemo(
    () => <Icon color={iconColor} size={24} source="circle" />,
    [iconColor]
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

RecordSyncStatusIcon.propTypes = DataVisualizerCellPropTypes;
