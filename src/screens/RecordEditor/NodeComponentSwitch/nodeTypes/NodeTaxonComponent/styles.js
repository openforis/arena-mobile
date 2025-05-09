import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { gap: 10 },
  containerOneNode: { flex: 1 },
  searchButton: {
    alignSelf: "center",
  },
  selectedTaxonWrapper: {},
  selectedTaxonContainer: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 20,
    alignItems: "center",
    width: "auto",
  },
  selectedTaxonText: {
    flex: undefined,
  },
});
