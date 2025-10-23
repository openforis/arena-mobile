import { useCallback, useMemo } from "react";

import { SegmentedButtons, View } from "components";

import { useNodeComponentLocalState } from "../../useNodeComponentLocalState";
import { NodeComponentPropTypes } from "./nodeComponentPropTypes";
import { useIsTextDirectionRtl } from "localization/useTextDirection";

const booleanValues = ["true", "false"];
const yesNoValueByBooleanValue = {
  true: "yes",
  false: "no",
};

const baseStyle = { width: 200 };
const rtlStyle = { alignSelf: "flex-end" };

export const NodeBooleanComponent = (props) => {
  const { nodeDef, nodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeBooleanComponent for ${nodeDef.props.name}`);
  }
  const isRtl = useIsTextDirectionRtl();
  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });

  const onChange = useCallback(
    (val) => {
      updateNodeValue({ value: val === value ? null : val });
    },
    [updateNodeValue, value]
  );

  const labelValue = nodeDef.props.labelValue ?? "trueFalse";

  const getLabelKey = useCallback(
    (booleanValue) =>
      labelValue === "trueFalse"
        ? booleanValue
        : yesNoValueByBooleanValue[booleanValue],
    [labelValue]
  );

  const style = useMemo(() => {
    const _style = [baseStyle];
    if (isRtl) {
      _style.push(rtlStyle);
    }
    return _style;
  }, [isRtl]);

  return (
    <View style={style}>
      <SegmentedButtons
        buttons={booleanValues.map((val) => ({
          value: val,
          label: `common:${getLabelKey(val)}`,
        }))}
        onChange={onChange}
        value={value}
      />
    </View>
  );
};

NodeBooleanComponent.propTypes = NodeComponentPropTypes;
