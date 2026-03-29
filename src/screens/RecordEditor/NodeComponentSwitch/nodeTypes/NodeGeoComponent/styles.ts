import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    height: 250,
  },
  helperText: {
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  draftPoint: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  draftPointInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  midpoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dotted",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalContent: {
    flex: 1,
  },
});
