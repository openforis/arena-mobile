import { DataVisualizerCellPropTypes, Icon } from "components";
import { SurveyStatus, UpdateStatus } from "model";

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

export const SurveyStatusCell = ({ item }) =>
  item.status ? (
    <Icon
      color={statusIconColorByStatus[item.status]}
      source={statusIconByStatus[item.status]}
    />
  ) : null;

SurveyStatusCell.propTypes = DataVisualizerCellPropTypes;
