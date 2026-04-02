import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
    minHeight: 250,
  },
  helperText: {
    textAlign: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
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
    borderColor: "rgba(255, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 4,
    backgroundColor: "rgba(255, 255, 255, 1)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  vertexPointCore: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  vertexPointCoreSelected: {
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
  toolbarTopRow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  toolbarBottomRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalContent: {
    flex: 1,
  },
});
