import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    rowGap: 2,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  step: {
    borderRadius: 6,
  },
  stepHeader: {
    alignItems: "center",
    columnGap: 8,
    minHeight: 34,
    paddingHorizontal: 6,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  stepTitle: {
    flexShrink: 0,
  },
  stepTitleExpanded: {
    flex: 1,
    fontWeight: "bold",
  },
  stepSummary: {
    flex: 1,
    textAlign: "right",
    opacity: 0.8,
  },
  stepContent: {
    rowGap: 4,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  stepActions: {
    justifyContent: "flex-end",
  },
  stepHint: {
    opacity: 0.8,
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
