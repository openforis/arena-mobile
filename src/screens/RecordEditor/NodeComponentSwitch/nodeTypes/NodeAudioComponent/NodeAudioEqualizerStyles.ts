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
    alignItems: "flex-end",
    columnGap: 1,
    height: 52,
    justifyContent: "center",
  },
  equalizerBar: {
    borderRadius: 1,
    minHeight: 5,
    width: 3,
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
