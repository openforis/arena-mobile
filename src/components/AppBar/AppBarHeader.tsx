import React from "react";
import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  children?: React.ReactNode;
  elevated?: boolean;
  mode?: "small" | "medium" | "large" | "center-aligned";
};

export const AppBarHeader = (props: Props) => {
  const { children, elevated, mode } = props;
  return (
    <RNPAppbar.Header elevated={elevated} mode={mode}>
      {children}
    </RNPAppbar.Header>
  );
};
