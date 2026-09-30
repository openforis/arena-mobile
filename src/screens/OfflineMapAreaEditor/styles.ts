import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    rowGap: 4,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  zoomRow: {
    alignItems: "center",
  },
  zoomLabel: {
    flexShrink: 0,
  },
  zoomSlider: {
    flex: 1,
  },
  estimateText: {
    fontWeight: "bold",
  },
  estimateTextError: {
    color: "#d32f2f",
  },
});
