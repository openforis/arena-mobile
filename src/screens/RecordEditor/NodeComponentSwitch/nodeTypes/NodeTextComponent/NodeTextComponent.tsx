import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { NodeDefType, NodeDefs, Objects } from "@openforis/arena-core";

import { CopyToClipboardButton, HView, TextInput } from "components";
import { RecordEditViewMode } from "model";
import { DataEntrySelectors, SurveyOptionsSelectors } from "state";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { useStyles } from "./styles";

const isNumericByType: Record<string, boolean> = {
  [NodeDefType.decimal]: true,
  [NodeDefType.integer]: true,
};

const multilineNumberOfLines = 5;

type NodeTextComponentProps = {
  nodeDef: any;
  nodeUuid?: string;
  style?: any;
  wrapperStyle?: any;
};

export const NodeTextComponent = (props: NodeTextComponentProps) => {
  const { nodeDef, nodeUuid, style: styleProp, wrapperStyle } = props;

  if (__DEV__) {
    console.log(`rendering NodeTextComponent for ${nodeDef.props.name}`);
  }

  const inputRef = useRef(null as any);
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const isActiveChild =
    DataEntrySelectors.useIsNodeDefCurrentActiveChild(nodeDef);

  const styles = useStyles({ wrapperStyle });

  const isNumeric = !!isNumericByType[nodeDef.type];

  const editable = !NodeDefs.isReadOnly(nodeDef);
  const multiline =
    NodeDefs.getType(nodeDef) === NodeDefType.text &&
    nodeDef.props.textInputType === "multiLine";

  const nodeValueToUiValue = useCallback(
    (value: any) => (Objects.isEmpty(value) ? "" : String(value)),
    []
  );

  const uiValueToNodeValue = useCallback(
    (uiValue: any) => {
      if (Objects.isEmpty(uiValue)) return null;
      if (isNumeric) {
        return Number(String(uiValue).replaceAll(",", "."));
      }
      return uiValue;
    },
    [isNumeric]
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
    [updateNodeValue]
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

  const style = useMemo(() => {
    const _style = [styles.textInput, styleProp];
    if (!applicable) {
      _style.push(styles.notApplicable);
    }
    return _style;
  }, [applicable, styleProp, styles.notApplicable, styles.textInput]);

  return (
    <HView style={styles.wrapper}>
      <TextInput
        editable={editable}
        error={invalidValue}
        keyboardType={isNumeric ? "numeric" : undefined}
        ref={inputRef}
        style={style}
        multiline={multiline}
        numberOfLines={multiline ? multilineNumberOfLines : 1}
        onChange={onChange}
        value={uiValue}
      />
      {!editable && <CopyToClipboardButton value={uiValue} />}
    </HView>
  );
};
