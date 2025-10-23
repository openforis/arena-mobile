import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      borderWidth: 1,
      borderRadius: 5,
      borderColor: theme.colors.onBackground,
    },
    headerContainer: {
      marginHorizontal: 8,
      marginVertical: 4,
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerText: {
      flex: 1,
      color: theme.colors.primary,
    },
    collapsibleContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
  });
};
