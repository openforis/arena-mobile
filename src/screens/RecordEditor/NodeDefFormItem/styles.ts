import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    formItem: {
      width: "100%",
      paddingTop: 8,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
    },
    formItemOneNode: {
      flex: 1,
      borderBottomWidth: 0,
    },
    nodeDefLabelContainer: {
      alignItems: "center",
    },
    headerIconButton: {
      margin: 0,
    },
    keyIcon: {
      marginRight: 4,
    },
    nodeDefLabelWrapper: {
      flex: 1,
      alignItems: "center",
    },
    nodeDefLabel: {
      flexShrink: 1,
    },
    requiredMarker: {
      color: theme.colors.error,
      fontWeight: "bold",
    },
    nodeDefDescriptionViewMoreText: {
      textAlign: "justify",
    },
    nodeDefDescriptionViewMoreTextRtl: {
      textAlign: "right",
    },
    nodeDefDescriptionText: {
      fontStyle: "italic",
    },
    internalContainer: {
      width: "100%",
    },
  });
};
