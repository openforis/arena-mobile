import { StyleSheet } from "react-native";

export default StyleSheet.create({
  entityButtonWrapper: {
    flex: 1,
  },
  entityButtonContent: {
    flex: 1,
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  entityButtonText: {
    flex: 1,
    flexWrap: "wrap",
  },
  entityButtonNonCurrentEntityText: {
    fontSize: 20,
    fontWeight: "normal",
  },
  entityButtonCurrentEntityText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
