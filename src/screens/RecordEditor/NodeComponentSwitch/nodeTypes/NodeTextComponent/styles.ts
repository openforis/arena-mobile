import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = ({ wrapperStyle }: any) => {
  const theme = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          width: "100%",
          ...wrapperStyle,
        },
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
    [theme, wrapperStyle]
  );
};
