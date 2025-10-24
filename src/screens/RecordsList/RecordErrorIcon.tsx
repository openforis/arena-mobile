import { Validations, ValidationSeverity } from "@openforis/arena-core";

import { DataVisualizerCellPropTypes, Icon, Tooltip } from "components";
import { useTranslation } from "localization";

const colors = {
  tooltipBackgroundColor: {
    [ValidationSeverity.error]: "red",
    [ValidationSeverity.warning]: "orange",
  },
  tooltipTextColor: {
    [ValidationSeverity.error]: "white",
    [ValidationSeverity.warning]: "black",
  },
};

export const RecordErrorIcon = (props: any) => {
  const { item: record } = props;
  const { t } = useTranslation();
  const validation = Validations.getValidation(record);
  const errors = Validations.getErrorsCount(validation);
  const warnings = Validations.getWarningsCount(validation);

  if (!errors && !warnings) return null;

  const severity = errors
    ? ValidationSeverity.error
    : ValidationSeverity.warning;

  const tooltipBackgroundColor = colors.tooltipBackgroundColor[severity];
  const tooltipTextColor = colors.tooltipTextColor[severity];

  const count = errors > 0 ? errors : warnings;
  const messageKey = "recordsList:recordHasErrorsOrWarningsTooltip";
  const itemsTypeKey =
    severity === ValidationSeverity.error ? "common:error" : "common:warning";
  const itemsTypeText = t(itemsTypeKey, { count });
  const messageParams = { count, itemsTypeText };

  return (
    <Tooltip
      backgroundColor={tooltipBackgroundColor}
      textColor={tooltipTextColor}
      titleKey={messageKey}
      titleParams={messageParams}
    >
      <Icon color={tooltipBackgroundColor} source="alert" />
    </Tooltip>
  );
};

RecordErrorIcon.propTypes = DataVisualizerCellPropTypes;
