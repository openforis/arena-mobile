import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();
  const { colors } = theme;

  return StyleSheet.create({
    item: {
      padding: 10,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
  });
};
