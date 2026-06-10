import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();

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
