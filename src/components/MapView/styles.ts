import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  zoomControls: {
    position: "absolute",
    bottom: 8,
    right: 8,
    alignItems: "center",
    zIndex: 1,
  },
  zoomLevel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#ffffff",
    fontSize: 11,
  },
  mapTypeSelector: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  pdfMapItems: {
    rowGap: 8,
    paddingVertical: 8,
  },
  pdfMapItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pdfMapItemHeader: {
    alignItems: "center",
  },
  pdfMapItemCheckbox: {
    flex: 1,
  },
  pdfMapOpacityRow: {
    alignItems: "center",
    columnGap: 8,
  },
  pdfMapOpacitySlider: {
    flex: 1,
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
  // below the offline badge and the layer selector
  layerNameContainer: {
    position: "absolute",
    top: 48,
    left: 8,
    right: 8,
    alignItems: "center",
  },
  layerName: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#ffffff",
    textAlign: "center",
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
