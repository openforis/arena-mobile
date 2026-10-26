import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    list: { flex: 1 },
    listContent: { padding: 4, gap: 8 },
    card: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.elevation.level1,
      padding: 12,
      gap: 8,
    },
    cardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primaryContainer,
    },
    cardsRow: { gap: 8 },
    header: { alignItems: "flex-start", gap: 8 },
    headerTexts: { flex: 1, gap: 2 },
    badges: {
      alignItems: "center",
      justifyContent: "flex-end",
      flexShrink: 0,
      maxWidth: "50%",
      columnGap: 6,
    },
    muted: { color: colors.onSurfaceVariant },
    divider: { height: 1, backgroundColor: colors.outlineVariant },
    fieldRows: { flexDirection: "row", columnGap: 16 },
    fieldRowsColumn: { flex: 1, gap: 2 },
    fieldRow: { alignItems: "center", gap: 8, minHeight: 22 },
    fieldRowValue: { flex: 1 },
    fieldRowValueEmphasized: { fontWeight: "bold" },
    sortBar: { alignItems: "center", justifyContent: "flex-end", gap: 4 },
  });
};

export type DataCardsStyles = ReturnType<typeof useStyles>;
