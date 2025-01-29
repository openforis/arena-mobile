import { useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";

import { NodeDefType, NodeDefs, Objects } from "@openforis/arena-core";

import { SystemUtils } from "utils";
import { HView, IconButton, TextInput } from "components";
import { useToast } from "hooks";
import { RecordEditViewMode } from "model";
import { DataEntrySelectors, SurveyOptionsSelectors } from "state";
import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { useStyles } from "./styles";

const isNumericByType = {
  [NodeDefType.decimal]: true,
  [NodeDefType.integer]: true,
};

export const NodeTextComponent = (props) => {
  const { nodeDef, nodeUuid, style: styleProp, wrapperStyle } = props;

  if (__DEV__) {
    console.log(`rendering NodeTextComponent for ${nodeDef.props.name}`);
  }

  const inputRef = useRef();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();
  const isActiveChild =
    DataEntrySelectors.useIsNodeDefCurrentActiveChild(nodeDef);

  const styles = useStyles({ wrapperStyle });

  const isNumeric = !!isNumericByType[nodeDef.type];

  const toaster = useToast();

  const editable = !NodeDefs.isReadOnly(nodeDef);
  const multiline =
    NodeDefs.getType(nodeDef) === NodeDefType.text &&
    nodeDef.props.textInputType === "multiLine";

  const nodeValueToUiValue = useCallback(
    (value) => (Objects.isEmpty(value) ? "" : String(value)),
    []
  );

  const uiValueToNodeValue = useCallback(
    (uiValue) => {
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
    (value) => {
      updateNodeValue({ value });
    },
    [updateNodeValue]
  );

  const onCopyPress = () => {
    if (SystemUtils.copyValueToClipboard(uiValue)) {
      toaster("common:textCopiedToClipboard");
    }
  };

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
        numberOfLines={multiline ? 4 : 1}
        onChange={onChange}
        value={uiValue}
      />
      {!editable && (
        <IconButton
          disabled={Objects.isEmpty(uiValue)}
          icon="content-copy"
          onPress={onCopyPress}
        />
      )}
    </HView>
  );
};

NodeTextComponent.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
  style: PropTypes.object,
  wrapperStyle: PropTypes.object,
};
