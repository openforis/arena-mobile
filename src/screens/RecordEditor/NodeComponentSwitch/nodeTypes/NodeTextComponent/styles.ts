import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useAppTheme } from "theme";

export const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        textInput: {
          display: "flex",
          flex: 1,
          alignSelf: "stretch",
        },
        notApplicable: {
          backgroundColor: theme.colors.surfaceVariant,
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [theme],
  );
};
