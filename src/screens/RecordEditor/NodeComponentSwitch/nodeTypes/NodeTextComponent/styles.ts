import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useAppTheme } from "theme";

export const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        textInput: {
          alignSelf: "stretch",
        },
        // applied to the inner native input, so it grows with its content
        multilineInput: {
          // about 5 rows (multiline line height is 24)
          minHeight: 120,
        },
        multilineScrollView: {
          alignSelf: "stretch",
        },
        multilineScrollViewOneNode: {
          flex: 1,
        },
        multilineScrollViewForm: {
          // about 10 rows
          maxHeight: 260,
        },
        notApplicable: {
          backgroundColor: theme.colors.surfaceVariant,
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [theme],
  );
};
