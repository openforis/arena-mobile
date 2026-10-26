import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  NodeDefTextInputType,
  NodeDefType,
  NodeDefs,
  Objects,
} from "@openforis/arena-core";

import { ScrollView, TextInput } from "components";
import { RecordEditViewMode } from "model";
import { DataEntrySelectors, SurveyOptionsSelectors } from "state";
import { log } from "utils";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeComponentProps } from "../nodeComponentPropTypes";
import { useStyles } from "./styles";

const isNumericByType: Record<string, boolean> = {
  [NodeDefType.decimal]: true,
  [NodeDefType.integer]: true,
};

const nodeValueToUiValue = (value: any) =>
  Objects.isEmpty(value) ? "" : String(value);

export const NodeTextComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid, style: styleProp } = props;

  const nodeDefName = NodeDefs.getName(nodeDef);
  log.debug(`rendering NodeTextComponent for ${nodeDefName}`);

  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const isActiveChild =
    DataEntrySelectors.useIsNodeDefCurrentActiveChild(nodeDef);
  const inputRef = useRef(null as any);

  const styles = useStyles();

  const isNumeric = !!isNumericByType[nodeDef.type];

  const isReadOnly = NodeDefs.isReadOnly(nodeDef);
  const editable = !isReadOnly;
  const multiline =
    NodeDefs.getType(nodeDef) === NodeDefType.text &&
    NodeDefs.getTextInputType(nodeDef) === NodeDefTextInputType.multiLine;

  const uiValueToNodeValue = useCallback(
    (uiValue: any) => {
      if (Objects.isEmpty(uiValue)) return null;
      if (isNumeric) {
        return Number(String(uiValue).replaceAll(",", "."));
      }
      return uiValue;
    },
    [isNumeric],
  );

  const { applicable, invalidValue, uiValue, updateNodeValue } =
    useNodeComponentLocalState({
      nodeUuid,
      updateDelay: 500,
      nodeValueToUiValue,
      uiValueToNodeValue,
    });

  const onChange = useCallback(
    (value: any) => {
      updateNodeValue({ value });
    },
    [updateNodeValue],
  );

  // focus on text input when in single-node view mode and this is the active item
  useEffect(() => {
    if (
      inputRef.current &&
      editable &&
      viewMode === RecordEditViewMode.oneNode &&
      isActiveChild
    ) {
      inputRef.current.focus();
    }
  }, [editable, isActiveChild, viewMode]);

  const isOneNodeViewMode = viewMode === RecordEditViewMode.oneNode;

  const style = useMemo(() => {
    // when multiline, styleProp is applied to the wrapping ScrollView
    const _style = [styles.textInput, multiline ? undefined : styleProp];
    if (!applicable) {
      _style.push(styles.notApplicable);
    }
    return _style;
  }, [applicable, multiline, styleProp, styles]);

  const multilineScrollViewStyle = useMemo(
    () => [
      styles.multilineScrollView,
      isOneNodeViewMode
        ? styles.multilineScrollViewOneNode
        : styles.multilineScrollViewForm,
      styleProp,
    ],
    [isOneNodeViewMode, styleProp, styles],
  );

  const textInput = (
    <TextInput
      editable={editable}
      error={invalidValue}
      keyboardType={isNumeric ? "numeric" : undefined}
      ref={inputRef}
      inputStyle={multiline ? styles.multilineInput : undefined}
      style={style}
      multiline={multiline}
      // on Android numberOfLines fixes the input height: multiline inputs must grow with their content
      numberOfLines={multiline ? undefined : 1}
      onChange={onChange}
      testID={nodeDefName}
      value={uiValue}
    />
  );

  // RN TextInput has no visible scrollbar on Android: let the input grow and scroll its container instead
  if (multiline) {
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        persistentScrollbar
        style={multilineScrollViewStyle}
      >
        {textInput}
      </ScrollView>
    );
  }
  return textInput;
};
