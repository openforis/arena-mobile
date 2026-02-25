import { StyleSheet } from "react-native";

export default StyleSheet.create({
  equalizerWrapper: {
    alignSelf: "stretch",
    height: 56,
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  equalizerContainer: {
    alignSelf: "stretch",
    alignItems: "center",
    columnGap: 1,
    height: 52,
    justifyContent: "center",
  },
  equalizerBar: {
    borderRadius: 2,
    minHeight: 4,
    width: 2,
  },
  playhead: {
    borderRadius: 1,
    height: 44,
    left: "50%",
    marginLeft: -1,
    position: "absolute",
    width: 2,
  },
});
