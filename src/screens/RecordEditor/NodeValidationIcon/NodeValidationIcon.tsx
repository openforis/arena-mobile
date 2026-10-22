import { useCallback, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TextLayoutEventData,
  useWindowDimensions,
  View,
} from "react-native";
import { Text as RNPText } from "react-native-paper";

import {
  NodeDefs,
  Validations,
  ValidationSeverity,
} from "@openforis/arena-core";

import { Icon, MessageDialog, Tooltip } from "components";
import { useTranslation } from "localization";
import { ValidationUtils } from "model";
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

const dialogTitleKeyBySeverity = {
  [ValidationSeverity.error]: "common:error",
  [ValidationSeverity.warning]: "common:warning",
};

const iconHitSlop = 10;

// horizontal padding of the react-native-paper tooltip
const tooltipPaddingHorizontal = 16;

const styles = StyleSheet.create({
  messageMeasureContainer: {
    position: "absolute",
    opacity: 0,
  },
});

type ValidationIconProps = {
  severity: ValidationSeverity;
  messageKey: string;
  messageParams?: any;
};

// the tooltip shows only one line: messages longer than that are shown in a dialog
const ValidationIcon = (props: ValidationIconProps) => {
  const { severity, messageKey, messageParams } = props;

  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [messageFitsOneLine, setMessageFitsOneLine] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  const showDialog = useCallback(() => setDialogVisible(true), []);
  const hideDialog = useCallback(() => setDialogVisible(false), []);

  const onMessageTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) =>
      setMessageFitsOneLine(event.nativeEvent.lines.length <= 1),
    [],
  );

  const tooltipBackgroundColor = colors.tooltipBackgroundColor[severity];
  const tooltipTextColor = colors.tooltipTextColor[severity];
  const icon = <Icon color={tooltipBackgroundColor} source="alert" />;

  return (
    <>
      {/* invisible copy of the tooltip text, with its max width, to know if the message fits one line */}
      <View
        pointerEvents="none"
        style={[
          styles.messageMeasureContainer,
          { width: windowWidth - tooltipPaddingHorizontal * 2 },
        ]}
      >
        <RNPText variant="labelLarge" onTextLayout={onMessageTextLayout}>
          {t(messageKey, messageParams)}
        </RNPText>
      </View>
      {messageFitsOneLine ? (
        <Tooltip
          backgroundColor={tooltipBackgroundColor}
          textColor={tooltipTextColor}
          titleKey={messageKey}
          titleParams={messageParams}
        >
          {icon}
        </Tooltip>
      ) : (
        <Pressable hitSlop={iconHitSlop} onPress={showDialog}>
          {icon}
        </Pressable>
      )}
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
