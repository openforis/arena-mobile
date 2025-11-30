import { useCallback, useMemo } from "react";

import { SegmentedButtons, View } from "components";
import { log } from "utils";

import { useNodeComponentLocalState } from "../../useNodeComponentLocalState";
import { NodeComponentProps } from "./nodeComponentPropTypes";
import { useIsTextDirectionRtl } from "localization/useTextDirection";

const booleanValues = ["true", "false"];
const yesNoValueByBooleanValue: Record<string, string> = {
  true: "yes",
  false: "no",
};

const baseStyle = { width: 200 };
const rtlStyle = { alignSelf: "flex-end" };

export const NodeBooleanComponent = (props: NodeComponentProps) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeBooleanComponent for ${nodeDef.props.name}`);
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
    (booleanValue: any) =>
      labelValue === "trueFalse"
        ? booleanValue
        : yesNoValueByBooleanValue[booleanValue],
    [labelValue]
  );

  const style = useMemo(() => {
    const _style: any[] = [baseStyle];
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
