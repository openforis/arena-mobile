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
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "#ffffff",
  },
  toolbar: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
