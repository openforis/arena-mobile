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
    gap: 4,
    paddingBottom: 6,
  },
  buttons: {
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
});
