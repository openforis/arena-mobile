import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  // color and mode are injected by AppBarHeader
  color?: string;
  mode?: "small" | "medium" | "large" | "center-aligned";
  style?: StyleProp<ViewStyle>;
  title: React.ReactNode;
};

export const AppBarContent = (props: Props) => {
  const { color, mode, style, title } = props;
  return (
    <RNPAppbar.Content color={color} mode={mode} style={style} title={title} />
  );
};

// the header places its children according to their displayName
AppBarContent.displayName = "Appbar.Content";
