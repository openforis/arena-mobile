import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  mapTypeSelector: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  attribution: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  attributionText: {
    fontSize: 9,
    color: "#333333",
  },
  offlineBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  offlineBadgeText: {
    fontSize: 11,
    color: "#ffffff",
  },
});
