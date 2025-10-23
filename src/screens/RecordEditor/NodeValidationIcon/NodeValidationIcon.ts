// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import {
  NodeDefs,
  Validations,
  ValidationSeverity,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Icon, Tooltip } from "components";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { ValidationUtils } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntrySelectors, SurveySelectors } from "state";

const { getJointErrorText, getJointWarningText } = ValidationUtils;

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

const ValidationIcon = (props: any) => {
  const { severity, messageKey, messageParams } = props;
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const tooltipBackgroundColor = colors.tooltipBackgroundColor[severity];
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const tooltipTextColor = colors.tooltipTextColor[severity];
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
      // @ts-expect-error TS(2304): Cannot find name 'color'.
      <Icon color={tooltipBackgroundColor} source="alert" />
    </Tooltip>
  );
};

ValidationIcon.propTypes = {
  messageKey: PropTypes.string.isRequired,
  messageParams: PropTypes.object,
  severity: PropTypes.oneOf(["error", "warning"]),
};

export const NodeValidationIcon = (props: any) => {
  const { nodeDef, parentNodeUuid } = props;

  const { t } = useTranslation();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const customMessageLang = lang;

  const nodeDefUuid = nodeDef.uuid;

  const validation = DataEntrySelectors.useRecordNodePointerValidation({
    parentNodeUuid,
    nodeDefUuid,
  });

  const validationChildrenCount =
    DataEntrySelectors.useRecordNodePointerValidationChildrenCount({
      parentNodeUuid,
      nodeDefUuid,
    });

  if (!validation && !validationChildrenCount) return null;

  if (validationChildrenCount && !validationChildrenCount.valid) {
    const error = validationChildrenCount.errors[0];
    const { key: messageKey, params: messageParams } = error ?? {};
    return (
      // @ts-expect-error TS(2709): Cannot use namespace 'ValidationIcon' as a type.
      <ValidationIcon
        // @ts-expect-error TS(2349): This expression is not callable.
        messageKey={`validation:${messageKey}`}
        // @ts-expect-error TS(2304): Cannot find name 'messageParams'.
        messageParams={messageParams}
        // @ts-expect-error TS(2304): Cannot find name 'severity'.
        severity="error"
      />
    );
  }
  // @ts-expect-error TS(2552): Cannot find name 'validation'. Did you mean 'Valid... Remove this comment to see the full error message
  if (Validations.isNotValid(validation) && NodeDefs.isSingle(nodeDef)) {
    // @ts-expect-error TS(2552): Cannot find name 'validation'. Did you mean 'Valid... Remove this comment to see the full error message
    const errMsg = getJointErrorText({ validation, t, customMessageLang });
    // @ts-expect-error TS(2552): Cannot find name 'validation'. Did you mean 'Valid... Remove this comment to see the full error message
    const warnMsg = getJointWarningText({ validation, t, customMessageLang });
    return (
      <ValidationIcon
        messageKey={errMsg ?? warnMsg}
        // @ts-expect-error TS(2304): Cannot find name 'severity'.
        severity={errMsg ? "error" : "warning"}
      />
    );
  }
  return null;
};

// @ts-expect-error TS(7027): Unreachable code detected.
NodeValidationIcon.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
};
