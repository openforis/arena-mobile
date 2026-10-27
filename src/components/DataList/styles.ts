import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    list: { flex: 1 },
    listContent: { padding: 4, gap: 6 },
    item: {
      flexDirection: "row",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.elevation.level1,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    itemSelected: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
    },
    itemPressed: { opacity: 0.7 },
    accent: { width: 4, backgroundColor: colors.primary, opacity: 0.6 },
    accentSelected: { opacity: 1 },
    itemContent: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 8,
    },
    fields: { flex: 1, gap: 6 },
    divider: { height: 1, backgroundColor: colors.outlineVariant },
  });
};
