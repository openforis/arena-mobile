import { memo, useCallback, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { ArenaNodeDefBoolean, NodeDefs } from "@openforis/arena-core";

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
const rtlStyle: ViewStyle = { alignSelf: "flex-end" };

type Props = NodeComponentProps<ArenaNodeDefBoolean>;

export const NodeBooleanComponent = memo((props: Props) => {
  const { nodeDef, nodeUuid } = props;

  log.debug(`rendering NodeBooleanComponent for ${NodeDefs.getName(nodeDef)}`);
  const isRtl = useIsTextDirectionRtl();
  const { value, updateNodeValue } = useNodeComponentLocalState<string>({
    nodeUuid,
  });

  const onChange = useCallback(
    (val: string) => {
      updateNodeValue({ value: val === value ? null : val });
    },
    [updateNodeValue, value],
  );

  const labelValue = nodeDef.props.labelValue ?? "trueFalse";

  const getLabelKey = useCallback(
    (booleanValue: string) =>
      labelValue === "trueFalse"
        ? booleanValue
        : yesNoValueByBooleanValue[booleanValue],
    [labelValue],
  );

  const style = useMemo(() => {
    const _style: StyleProp<ViewStyle>[] = [baseStyle];
    if (isRtl) {
      _style.push(rtlStyle);
    }
    return _style;
  }, [isRtl]);

  const buttons = useMemo(
    () =>
      booleanValues.map((val) => ({
        value: val,
        label: `common:${getLabelKey(val)}`,
      })),
    [getLabelKey],
  );

  return (
    <View style={style}>
      <SegmentedButtons buttons={buttons} onChange={onChange} value={value} />
    </View>
  );
});

NodeBooleanComponent.displayName = "NodeBooleanComponent";
