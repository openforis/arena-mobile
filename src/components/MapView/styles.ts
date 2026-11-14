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
  surveyLayerGroup: {
    marginBottom: 12,
  },
  surveyLayerGroupTitle: {
    marginBottom: 6,
  },
  surveyLayerItems: {
    gap: 6,
  },
  surveyLayerItem: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  surveyLayerItemContent: {
    alignItems: "center",
    gap: 4,
  },
  surveyLayerLabel: {
    flex: 1,
  },
  surveyLayerColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  surveyLayerPoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
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
