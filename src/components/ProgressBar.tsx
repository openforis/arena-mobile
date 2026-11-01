import * as React from "react";
import { ProgressBar as RNPProgressBar } from "react-native-paper";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Environment } from "utils/Environment";

type Props = {
  color?: string;
  indeterminate?: boolean;
  progress?: number;
  style?: StyleProp<ViewStyle>;
};

const defaultStyle: ViewStyle = {
  alignSelf: "stretch",
  height: 20,
  margin: 10,
};

const fullHeightStyle: ViewStyle = { height: "100%" };

// on web Paper wraps the bar in a container with height 100%, resolved against an ancestor:
// layout props go to a parent with a definite height instead, otherwise the container grows over the following content
const splitWebStyle = (style: ViewStyle) => {
  const {
    alignSelf,
    height,
    margin,
    marginBottom,
    marginHorizontal,
    marginLeft,
    marginRight,
    marginTop,
    marginVertical,
    width,
    ...barStyle
  } = style;
  const containerStyle: ViewStyle = {
    alignSelf,
    height,
    margin,
    marginBottom,
    marginHorizontal,
    marginLeft,
    marginRight,
    marginTop,
    marginVertical,
    width,
  };
  return { containerStyle, barStyle: [barStyle, fullHeightStyle] };
};

export const ProgressBar = (props: Props) => {
  const { color, indeterminate = false, progress = 0, style } = props;

  const flatStyle = StyleSheet.flatten([defaultStyle, style]);

  if (!Environment.isWeb) {
    return (
      <RNPProgressBar
        color={color}
        indeterminate={indeterminate}
        progress={progress}
        style={flatStyle}
      />
    );
  }
  const { containerStyle, barStyle } = splitWebStyle(flatStyle ?? {});
  return (
    <View style={containerStyle}>
      <RNPProgressBar
        color={color}
        indeterminate={indeterminate}
        progress={progress}
        style={barStyle}
      />
    </View>
  );
};
