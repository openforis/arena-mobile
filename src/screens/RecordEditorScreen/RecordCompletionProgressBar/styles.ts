import { StyleSheet } from "react-native";

export default StyleSheet.create({
  completionContainer: {
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 6,
    width: "100%",
  },
  completionContainerCompact: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  completionProgressBar: { height: 6, margin: 0, borderRadius: 3 },
  completionText: { opacity: 0.7, marginTop: 2 },
});
