import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
    minHeight: 32,
  },
  headerText: {
    flex: 1,
  },
  details: {
    borderRadius: 8,
    gap: 4,
    marginBottom: 6,
    padding: 8,
  },
  buttons: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center",
  },
});
