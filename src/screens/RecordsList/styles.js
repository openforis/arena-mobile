import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  formItem: { alignItems: "center" },
  formItemLabel: { fontSize: 16, width: 170 },
  innerContainer: {
    flex: 1,
    padding: 4,
    gap: 4,
  },
  cyclesSelector: { width: 300 },
  bottomActionBar: {
    borderTopWidth: 1,
    padding: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  newRecordButton: {
    alignSelf: "center",
  },
  exportDataMenuButton: {
    alignSelf: "flex-end",
  },
});
