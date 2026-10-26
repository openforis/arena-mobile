import { StyleSheet } from "react-native";

import { useAppTheme } from "theme";

export const useStyles = () => {
  const theme = useAppTheme();

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
    nodeDefLabel: {
      flex: 1,
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
