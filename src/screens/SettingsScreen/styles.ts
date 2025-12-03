import { StyleSheet } from "react-native";

export default StyleSheet.create({
  settingsWrapper: {
    marginBottom: 20,
    rowGap: 4,
  },
  settingsItemWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsItemDescription: {
    fontStyle: "italic",
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
  settingsFormItemHorizontalRtl: {
    flexDirection: "row-reverse",
  },
  button: {
    alignSelf: "center",
  },
  logsCardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});
