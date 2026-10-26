import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  style?: StyleProp<ViewStyle>;
  title: React.ReactNode;
};

export const AppBarContent = (props: Props) => {
  const { style, title } = props;
  return <RNPAppbar.Content style={style} title={title} />;
};
