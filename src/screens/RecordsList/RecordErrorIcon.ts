import { Validations, ValidationSeverity } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { DataVisualizerCellPropTypes, Icon, Tooltip } from "components";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2304): Cannot find name 'backgroundColor'.
      backgroundColor={tooltipBackgroundColor}
      // @ts-expect-error TS(7027): Unreachable code detected.
      textColor={tooltipTextColor}
      // @ts-expect-error TS(2304): Cannot find name 'titleKey'.
      titleKey={messageKey}
      // @ts-expect-error TS(2304): Cannot find name 'titleParams'.
      titleParams={messageParams}
    >
      // @ts-expect-error TS(2552): Cannot find name 'color'. Did you mean 'colors'?
      <Icon color={tooltipBackgroundColor} source="alert" />
    </Tooltip>
  );
};

RecordErrorIcon.propTypes = DataVisualizerCellPropTypes;
