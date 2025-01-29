import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { Icon, Tooltip } from "components";
import { useTranslation } from "localization";
import { ValidationUtils } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";

const { getJointErrorText, getJointWarningText, isNotValid } = ValidationUtils;

const colors = {
  tooltipBackgroundColor: {
    error: "red",
    warning: "orange",
  },
  tooltipTextColor: {
    error: "white",
    warningTextColor: "black",
  },
};

const ValidationIcon = (props) => {
  const { severity, messageKey, messageParams } = props;
  const tooltipBackgroundColor = colors.tooltipBackgroundColor[severity];
  const tooltipTextColor = colors.tooltipTextColor[severity];
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

ValidationIcon.propTypes = {
  messageKey: PropTypes.string.isRequired,
  messageParams: PropTypes.object,
  severity: PropTypes.oneOf(["error", "warning"]),
};

export const NodeValidationIcon = (props) => {
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
      <ValidationIcon
        messageKey={`validation:${messageKey}`}
        messageParams={messageParams}
        severity="error"
      />
    );
  }
  if (isNotValid(validation) && NodeDefs.isSingle(nodeDef)) {
    const errMsg = getJointErrorText({ validation, t, customMessageLang });
    const warnMsg = getJointWarningText({ validation, t, customMessageLang });
    return (
      <ValidationIcon
        messageKey={errMsg ?? warnMsg}
        severity={errMsg ? "error" : "warning"}
      />
    );
  }
  return null;
};

NodeValidationIcon.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
};
