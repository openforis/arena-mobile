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
        // only multiline inputs fill the available height (e.g. in single node view mode)
        textInputMultiline: {
          flex: 1,
          // about 5 rows (multiline line height is 24)
          minHeight: 140,
        },
        notApplicable: {
          backgroundColor: theme.colors.surfaceVariant,
          color: theme.colors.onSurfaceVariant,
        },
      }),
    [theme],
  );
};
