import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Surface as RNPSurface } from "react-native-paper";

type SurfaceElevation = 0 | 1 | 2 | 3 | 4 | 5;

type Props = {
  children?: React.ReactNode;
  elevation?: SurfaceElevation;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const Surface = (props: Props) => {
  const { children, elevation = 1, style, testID } = props;
  return (
    <RNPSurface elevation={elevation} style={style} testID={testID}>
      {children}
    </RNPSurface>
  );
};
