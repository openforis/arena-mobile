import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { gap: 10 as const },
  containerOneNode: { flex: 1 as const },
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
