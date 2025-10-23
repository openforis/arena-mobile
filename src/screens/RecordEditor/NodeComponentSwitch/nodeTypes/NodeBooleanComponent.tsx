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

export const NodeBooleanComponent = (props: any) => {
  const { nodeDef, nodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeBooleanComponent for ${nodeDef.props.name}`);
  }
  const isRtl = useIsTextDirectionRtl();
  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });

  const onChange = useCallback(
    (val: any) => {
      updateNodeValue({ value: val === value ? null : val });
    },
    [updateNodeValue, value]
  );

  const labelValue = nodeDef.props.labelValue ?? "trueFalse";

  const getLabelKey = useCallback(
    (booleanValue: any) => labelValue === "trueFalse"
      ? booleanValue
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      : yesNoValueByBooleanValue[booleanValue],
    [labelValue]
  );

  const style = useMemo(() => {
    const _style = [baseStyle];
    if (isRtl) {
      // @ts-expect-error TS(2345): Argument of type '{ alignSelf: string; }' is not a... Remove this comment to see the full error message
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
