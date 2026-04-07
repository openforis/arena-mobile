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
  previewToolbarCenter: {
    alignItems: "center",
    justifyContent: "center",
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
