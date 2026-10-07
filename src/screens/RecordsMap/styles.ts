import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  cluster: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    opacity: 0.9,
  },
  clusterText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  clusterTextDark: {
    color: "#212121",
  },
  point: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  // below the map type selector of the MapView
  mapButtons: {
    position: "absolute",
    top: 56,
    right: 8,
    gap: 4,
  },
  bottomPanel: {
    maxHeight: "40%",
    padding: 8,
  },
  bottomPanelHeader: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomPanelTitle: {
    flex: 1,
  },
  pointItem: {
    paddingVertical: 4,
  },
  recordItem: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  recordItemLabel: {
    flex: 1,
  },
  layerItem: {
    alignItems: "center",
    gap: 8,
  },
  layerColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  layerCheckbox: {
    flex: 1,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emptyMessage: {
    padding: 16,
    textAlign: "center",
  },
});
