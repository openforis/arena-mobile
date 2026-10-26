import React from "react";
import { Provider as PaperProvider, ThemeProvider } from "react-native-paper";

import { AppTheme } from "./types";

type Props = {
  children?: React.ReactNode;
  theme: AppTheme;
};

export const AppThemeProvider = (props: Props) => {
  const { children, theme } = props;
  return (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PaperProvider>
  );
};
