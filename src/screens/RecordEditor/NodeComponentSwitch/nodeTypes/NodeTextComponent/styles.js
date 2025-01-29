import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = ({ wrapperStyle }) => {
  const theme = useTheme();

  return StyleSheet.create({
    wrapper: StyleSheet.compose([
      {
        width: "100%",
      },
      wrapperStyle,
    ]),
    textInput: {
      display: "flex",
      flex: 1,
      alignSelf: "stretch",
    },
    notApplicable: {
      backgroundColor: theme.colors.surfaceVariant,
      color: theme.colors.onSurfaceVariant,
    },
  });
};
