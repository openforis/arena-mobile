import { StyleSheet } from "react-native";

import { MarkdownStyle } from "components/Markdown";

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
  } as MarkdownStyle,
});
