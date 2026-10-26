import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Menu as RNPMenu } from "react-native-paper";

type Props = {
  anchor: React.ReactNode;
  anchorPosition?: "top" | "bottom";
  children?: React.ReactNode;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
  visible: boolean;
};

export const Menu = (props: Props) => {
  const { anchor, anchorPosition, children, onDismiss, style, visible } = props;
  return (
    <RNPMenu
      anchor={anchor}
      anchorPosition={anchorPosition}
      onDismiss={onDismiss}
      style={style}
      visible={visible}
    >
      {children}
    </RNPMenu>
  );
};
