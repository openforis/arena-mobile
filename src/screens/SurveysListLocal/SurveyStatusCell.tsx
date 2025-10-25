import { useMemo } from "react";

import {
  DataVisualizerCellPropTypes,
  HView,
  Icon,
  Text,
  Tooltip,
} from "components";
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
