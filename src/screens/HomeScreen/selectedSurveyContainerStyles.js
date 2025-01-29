import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    width: "90%",
  },
  internalContainer: {
    gap: 10,
    // alignItems: "center",
  },
  surveyTitleContainer: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surveyTitle: {
    flex: 1,
  },
  goToDataEntryButton: {
    alignSelf: "center",
  },
  updateStatusIconButton: {
    alignSelf: "flex-end",
  },
});
