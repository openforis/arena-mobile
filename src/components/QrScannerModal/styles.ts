import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
// We need a border large enough to cover the biggest screen dimension
const overlaySize = Math.max(width, height);

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // Ensure the parent doesn't have a solid fill
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  instructionsMarkdown: {
    body: {
      color: "white",
      padding: 20,
      width: "100%",
    },
  } as StyleSheet.NamedStyles<any>,
});
