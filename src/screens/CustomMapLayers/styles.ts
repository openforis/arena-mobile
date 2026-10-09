import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    rowGap: 10,
    paddingBottom: 20,
  },
  description: {
    opacity: 0.8,
  },
  addButton: {
    alignSelf: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  layerCard: {
    marginVertical: 6,
    marginHorizontal: 2,
    borderWidth: 1,
  },
  layerUrl: {
    opacity: 0.7,
  },
  layerFooter: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  layerMaxZoom: {
    flex: 1,
  },
});
