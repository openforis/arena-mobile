import React, { useMemo } from "react";

import {
  DataVisualizerCellPropTypes,
  HView,
  Icon,
  Text,
  Tooltip,
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordSyncStatus, ScreenViewMode } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state/screenOptions' or its co... Remove this comment to see the full error message
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

export const RecordSyncStatusIcon = (props: any) => {
  const { item, alwaysShowLabel = false } = props;
  const { syncStatus } = item;

  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsList = alwaysShowLabel || screenViewMode === ScreenViewMode.list;

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
