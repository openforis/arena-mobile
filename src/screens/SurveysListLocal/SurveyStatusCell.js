import { DataVisualizerCellPropTypes, Icon } from "components";
import { UpdateStatus } from "model";
import { SurveyStatus } from "./SurveyStatus";

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
  [SurveyStatus.notInArenaServer]: "orange",
  [SurveyStatus.notVisibleInMobile]: "orange",
};

export const SurveyStatusCell = ({ item }) =>
  item.status ? (
    <Icon
      color={statusIconColorByStatus[item.status]}
      source={statusIconByStatus[item.status]}
    />
  ) : null;

SurveyStatusCell.propTypes = DataVisualizerCellPropTypes;
