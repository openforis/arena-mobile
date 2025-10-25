import * as React from "react";
import { ProgressBar as RNPProgressBar } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  color?: string;
  indeterminate?: boolean;
  progress?: number;
  style?: StyleProp<ViewStyle>;
};

export const ProgressBar = (props: Props) => {
  const { color, indeterminate = false, progress = 100, style } = props;

  return (
    <RNPProgressBar
      color={color}
      indeterminate={indeterminate}
      progress={progress}
      style={[
        {
          alignSelf: "stretch",
          height: 20,
          margin: 10,
        },
        style,
      ]}
    />
  );
};
