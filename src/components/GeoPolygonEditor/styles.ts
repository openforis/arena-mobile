import { StyleSheet } from "react-native";

export const midpointDefaultBorderColor = "rgba(255, 0, 0, 0.3)";

const vertexPointDraggingStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 3,
  backgroundColor: "rgba(255, 255, 255, 1)",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 6,
  elevation: 8,
} as const;

export default StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
    minHeight: 250,
  },
  mapContainer: {
    flex: 1,
    minHeight: 250,
    position: "relative",
  },
  mapTopRightControl: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  helperText: {
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  draftPoint: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  midpoint: {
    width: 10,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: midpointDefaultBorderColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  midpointDragging: {
    ...vertexPointDraggingStyle,
  },
  vertexPoint: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  vertexPointSelected: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  vertexPointDragging: {
    ...vertexPointDraggingStyle,
  },
  vertexPointCore: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  vertexPointCoreSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vertexPointCoreDragging: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toolbar: {
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolbarTopRow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  toolbarBottomRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewToolbar: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
  },
  previewToolbarCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewToolbarRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationMarker: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#212121",
    backgroundColor: "transparent",
  },
  currentLocationMarkerHorizontal: {
    position: "absolute",
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#212121",
  },
  currentLocationMarkerVertical: {
    position: "absolute",
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: "#212121",
  },
  modalContent: {
    flex: 1,
  },
});
