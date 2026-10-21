import { PixelRatio, StyleSheet } from "react-native";

// On Android the custom markers are rendered into a bitmap that can be 100x100 pixels wide
// (react-native-maps default) instead of having the size of their content:
// the content is centered in a container with exactly that size and the marker is anchored
// to its center, so that it is aligned to its coordinate with every screen density.
// No elevation in marker styles: on Android it crops the view drawn into the marker bitmap
// (shadow* properties are used only on iOS).
const MARKER_BITMAP_SIZE_PIXELS = 100;
const markerContainerSize = MARKER_BITMAP_SIZE_PIXELS / PixelRatio.get();

export const markerCenterAnchor = { x: 0.5, y: 0.5 };

// markers cannot be bigger than their container
const limitMarkerSize = (size: number): number =>
  Math.min(size, markerContainerSize);

const vertexPointSelectedSize = limitMarkerSize(26);
const vertexPointDraggingSize = limitMarkerSize(32);

export const midpointDefaultBorderColor = "rgba(255, 0, 0, 0.3)";

const currentLocationMarkerBarStyle = {
  position: "absolute",
  borderRadius: 1,
  backgroundColor: "#212121",
} as const;

const vertexPointDraggingStyle = {
  width: vertexPointDraggingSize,
  height: vertexPointDraggingSize,
  borderRadius: vertexPointDraggingSize / 2,
  borderWidth: 3,
  backgroundColor: "rgba(255, 255, 255, 1)",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 6,
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
  helperTextOverlay: {
    position: "absolute",
    top: 6,
    left: 48,
    right: 48,
    alignItems: "center",
  },
  helperTextOverlayText: {
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
  helperText: {
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  markerContainer: {
    width: markerContainerSize,
    height: markerContainerSize,
    alignItems: "center",
    justifyContent: "center",
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
    width: vertexPointSelectedSize,
    height: vertexPointSelectedSize,
    borderRadius: vertexPointSelectedSize / 2,
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
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
  toolbarCompact: {
    paddingVertical: 0,
  },
  toolbarTopRow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  toolbarTopRowCompact: {
    minHeight: 0,
  },
  toolbarBottomRow: {
    alignItems: "center",
    justifyContent: "space-between",
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
    ...currentLocationMarkerBarStyle,
    width: 16,
    height: 2,
  },
  currentLocationMarkerVertical: {
    ...currentLocationMarkerBarStyle,
    width: 2,
    height: 16,
  },
  modalContent: {
    flex: 1,
  },
});
