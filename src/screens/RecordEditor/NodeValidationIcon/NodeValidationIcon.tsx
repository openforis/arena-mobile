import { useCallback, useState } from "react";
import { Pressable } from "react-native";

import {
  NodeDefs,
  Validations,
  ValidationSeverity,
} from "@openforis/arena-core";

import { Icon, MessageDialog } from "components";
import { useTranslation } from "localization";
import { ValidationUtils } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";

const { getJointErrorText, getJointWarningText } = ValidationUtils;

const iconColorBySeverity = {
  [ValidationSeverity.error]: "red",
  [ValidationSeverity.warning]: "orange",
};

const dialogTitleKeyBySeverity = {
  [ValidationSeverity.error]: "common:error",
  [ValidationSeverity.warning]: "common:warning",
};

const iconHitSlop = 10;

type ValidationIconProps = {
  severity: ValidationSeverity;
  messageKey: string;
  messageParams?: any;
};

// the full message is shown in a dialog: a tooltip shows only one line and truncates long messages
const ValidationIcon = (props: ValidationIconProps) => {
  const { severity, messageKey, messageParams } = props;

  const [dialogVisible, setDialogVisible] = useState(false);

  const showDialog = useCallback(() => setDialogVisible(true), []);
  const hideDialog = useCallback(() => setDialogVisible(false), []);

  const iconColor = iconColorBySeverity[severity];

  return (
    <>
      <Pressable hitSlop={iconHitSlop} onPress={showDialog}>
        <Icon color={iconColor} source="alert" />
      </Pressable>
      {dialogVisible && (
        <MessageDialog
          content={messageKey}
          contentParams={messageParams}
          onDismiss={hideDialog}
          title={dialogTitleKeyBySeverity[severity]}
        />
      )}
    </>
  );
};

type NodeValidationIconProps = {
  nodeDef: any;
  parentNodeUuid?: string;
};

export const NodeValidationIcon = (props: NodeValidationIconProps) => {
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
    const error = validationChildrenCount.errors?.[0];
    const { key: messageKey, params: messageParams } = error ?? {};
    return (
      <ValidationIcon
        messageKey={`validation:${messageKey}`}
        messageParams={messageParams}
        severity={ValidationSeverity.error}
      />
    );
  }
  if (
    validation &&
    Validations.isNotValid(validation) &&
    NodeDefs.isSingle(nodeDef)
  ) {
    const errMsg = getJointErrorText({ validation, t, customMessageLang });
    const warnMsg = getJointWarningText({ validation, t, customMessageLang });
    return (
      <ValidationIcon
        messageKey={errMsg ?? warnMsg}
        severity={
          errMsg ? ValidationSeverity.error : ValidationSeverity.warning
        }
      />
    );
  }
  return null;
};
