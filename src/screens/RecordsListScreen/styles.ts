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
  dock: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  dockRow: {
    alignItems: "center",
  },
  // grow equally to keep the center centered, but never shrink below their content (the "New"
  // button, the menu button): the center shrinks (wrapping its content) instead
  dockSide: {
    flexBasis: "auto",
    flexGrow: 1,
    flexShrink: 0,
  },
  dockCenter: {
    flexShrink: 1,
    justifyContent: "center",
    rowGap: 4,
  },
  dockSideEnd: {
    justifyContent: "flex-end",
  },
  newRecordButton: {
    minWidth: 100,
  },
  autoSyncGroup: { alignItems: "center", flexShrink: 1, gap: 4 },
  autoSyncLabel: { flexShrink: 1 },
  // the iOS Switch defaults to alignSelf "flex-start", ignoring the row's alignItems
  autoSyncSwitch: { alignSelf: "center" },
  exportDataButtonMenu: {
    alignSelf: "flex-end",
    transform: [{ translateY: -40 }],
  },
});
