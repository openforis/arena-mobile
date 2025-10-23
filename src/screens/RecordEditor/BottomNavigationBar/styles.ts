import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 10,
      justifyContent: "space-between",
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      backgroundColor: theme.colors.secondaryContainer,
      padding: 4,
    },
    buttonContainer: {
      flex: 1,
    },
    leftButton: {
      alignSelf: "flex-start",
    },
    rightButton: {
      alignSelf: "flex-end",
    },
  });
};
