import { StyleSheet } from "react-native";

export default StyleSheet.create({
  settingsWrapper: {
    marginBottom: 20,
  },
  settingsItemWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsFormItemVertical: {
    flexDirection: "column",
  },
  settingsFormItemHorizontal: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    alignSelf: "center",
  },
});
