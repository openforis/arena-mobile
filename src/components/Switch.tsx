import * as React from "react";
import { Switch as RNPSwitch } from "react-native-paper";

type Props = {
  onChange?: (value: boolean) => void;
  value?: boolean;
};

export const Switch = (props: Props) => {
  const { onChange, value } = props;

  const onValueChange = () => onChange?.(!value);

  return <RNPSwitch value={value} onValueChange={onValueChange} />;
};
