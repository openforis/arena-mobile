import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  nameRow: {
    alignItems: "center",
  },
  nameInput: {
    flex: 1,
  },
  nameError: {
    color: "#d32f2f",
  },
  warningText: {
    color: "#e65100",
  },
  baseMapRow: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  map: {
    flex: 1,
  },
  notFoundText: {
    textAlign: "center",
    marginTop: 20,
  },
});
