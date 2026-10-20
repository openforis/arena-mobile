import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  previewToolbar: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
  },
  previewToolbarLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  previewToolbarCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  trackButtons: {
    flexDirection: "row",
    gap: 8,
  },
  previewToolbarRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
