import { useMemo } from "react";

import {
  DataVisualizerCellProps,
  HView,
  Icon,
  Text,
  Tooltip,
} from "components";
import { ScreenViewMode, SurveyStatus, UpdateStatus } from "model";

const statusIconByStatus: Record<UpdateStatus | SurveyStatus, string> = {
  [UpdateStatus.error]: "alert",
  [UpdateStatus.loading]: "alert",
  [UpdateStatus.networkNotAvailable]: "alert",
  [UpdateStatus.notUpToDate]: "update",
  [UpdateStatus.upToDate]: "check",
  [SurveyStatus.notInArenaServer]: "alert",
  [SurveyStatus.notVisibleInMobile]: "alert",
};

const statusIconColorByStatus: Record<UpdateStatus | SurveyStatus, string> = {
  [UpdateStatus.error]: "red",
  [UpdateStatus.loading]: "orange",
  [UpdateStatus.networkNotAvailable]: "orange",
  [UpdateStatus.notUpToDate]: "orange",
  [UpdateStatus.upToDate]: "green",
  [SurveyStatus.notInArenaServer]: "red",
  [SurveyStatus.notVisibleInMobile]: "red",
};

export const SurveyStatusCell = (props: DataVisualizerCellProps) => {
  const { item, viewMode } = props;
  const status: SurveyStatus | UpdateStatus = item.status;

  const icon = useMemo(
    () =>
      status && (
        <Icon
          color={statusIconColorByStatus[status]}
          source={statusIconByStatus[status]}
        />
      ),
    [status],
  );

  if (!status) return null;

  const textKey = Object.keys(UpdateStatus).includes(status)
    ? `surveys:updateStatus.${status}`
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
