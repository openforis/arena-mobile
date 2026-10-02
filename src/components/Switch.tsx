import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Switch as RNPSwitch } from "react-native-paper";

type Props = {
  onChange?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  value?: boolean;
};

export const Switch = (props: Props) => {
  const { onChange, style, value } = props;

  const onValueChange = () => onChange?.(!value);

  return (
    <RNPSwitch onValueChange={onValueChange} style={style} value={value} />
  );
};
