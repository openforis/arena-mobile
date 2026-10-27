import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  table: {
    flex: 1,
  },
  tableTitleText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  tableTitleTextSelected: {
    maxWidth: 40,
    minWidth: 40,
  },
  expandColumn: {
    maxWidth: 36,
    minWidth: 36,
    justifyContent: "center",
  },
  expandedRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableTitleCellText: {
    flex: 1,
  },
});
