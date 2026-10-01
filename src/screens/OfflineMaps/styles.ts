import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    rowGap: 10,
    paddingBottom: 20,
  },
  description: {
    opacity: 0.8,
  },
  warningCard: {
    marginVertical: 4,
  },
  storageCard: {
    marginVertical: 4,
  },
  storageRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  storageLabel: {
    flex: 1,
  },
  buttonsRow: {
    justifyContent: "space-evenly",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  areaCard: {
    marginVertical: 6,
    marginHorizontal: 2,
    borderWidth: 1,
  },
  areaFooter: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaLastUpdate: {
    flex: 1,
  },
  missingTilesRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  warningText: {
    color: "#e65100",
    flex: 1,
  },
});
