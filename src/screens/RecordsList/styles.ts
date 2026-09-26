import { StyleSheet } from "react-native";

export default StyleSheet.create({
  optionsContainer: {
    gap: 20,
  },
  container: {
    flex: 1,
  },
  buttonsContainer: {
    gap: 20,
  },
  formItem: { alignItems: "center" },
  formItemLabel: { fontSize: 16, width: 170 },
  innerContainer: {
    flex: 1,
    padding: 4,
    gap: 8,
  },
  cyclesSelector: { width: 300 },
  bottomActionBar: {
    borderTopWidth: 1,
    padding: 4,
    justifyContent: "space-between",
    rowGap: 8,
  },
  newRecordButton: {
    alignSelf: "center",
  },
  toolbar: {
    rowGap: 8,
  },
  autoSyncCheckbox: { alignItems: "center" },
  autoSyncStatusItem: { alignItems: "center", gap: 8 },
  exportDataButtonMenu: {
    alignSelf: "flex-end",
    transform: [{ translateY: -40 }],
  },
});
