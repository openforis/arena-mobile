import { DataVisualizerCellPropTypes, Icon } from "components";
import { UpdateStatus } from "model";

const statusIconByStatus = {
  [UpdateStatus.error]: "alert",
  [UpdateStatus.notUpToDate]: "update",
  [UpdateStatus.upToDate]: "check",
};

const statusIconColorByStatus = {
  [UpdateStatus.error]: "red",
  [UpdateStatus.notUpToDate]: "orange",
  [UpdateStatus.upToDate]: "green",
};

export const SurveyStatusCell = ({ item }) =>
  item.status ? (
    <Icon
      color={statusIconColorByStatus[item.status]}
      source={statusIconByStatus[item.status]}
    />
  ) : null;

SurveyStatusCell.propTypes = DataVisualizerCellPropTypes;
