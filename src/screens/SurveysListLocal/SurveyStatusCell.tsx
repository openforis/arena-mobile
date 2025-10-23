import { useMemo } from "react";

import {
  DataVisualizerCellPropTypes,
  HView,
  Icon,
  Text,
  Tooltip,
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
} from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { ScreenViewMode, SurveyStatus, UpdateStatus } from "model";

const statusIconByStatus = {
  [UpdateStatus.error]: "alert",
  [UpdateStatus.notUpToDate]: "update",
  [UpdateStatus.upToDate]: "check",
  [SurveyStatus.notInArenaServer]: "alert",
  [SurveyStatus.notVisibleInMobile]: "alert",
};

const statusIconColorByStatus = {
  [UpdateStatus.error]: "red",
  [UpdateStatus.notUpToDate]: "orange",
  [UpdateStatus.upToDate]: "green",
  [SurveyStatus.notInArenaServer]: "red",
  [SurveyStatus.notVisibleInMobile]: "red",
};

export const SurveyStatusCell = (props: any) => {
  const { item, viewMode } = props;
  const { status } = item;

  const icon = useMemo(
    () =>
      status && (
        <Icon
          color={statusIconColorByStatus[status]}
          source={statusIconByStatus[status]}
        />
      ),
    [status]
  );

  if (!status) return null;

  const textKey = Object.keys(UpdateStatus).includes(status)
    ? `app:updateStatus.${status}`
    : `surveys:status.${status}`;

  return viewMode === ScreenViewMode.list ? (
    <HView style={{ width: "100%" }}>
      {icon}
      <Text textKey={textKey} />
    </HView>
  ) : (
    <Tooltip titleKey={textKey}>{icon}</Tooltip>
  );
};

SurveyStatusCell.propTypes = DataVisualizerCellPropTypes;
