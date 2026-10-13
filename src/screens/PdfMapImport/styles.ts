import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    rowGap: 4,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  messageContainer: {
    rowGap: 12,
    padding: 16,
    alignItems: "center",
  },
  messageText: {
    textAlign: "center",
  },
  zoomRow: {
    alignItems: "center",
    columnGap: 4,
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
  errorText: {
    color: "#d32f2f",
  },
  warningText: {
    color: "#e65100",
  },
  map: {
    flex: 1,
  },
  buttonsRow: {
    justifyContent: "space-evenly",
    paddingVertical: 8,
  },
});
