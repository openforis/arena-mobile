import { StyleSheet } from "react-native";

export default StyleSheet.create({
  mainContainer: {
    gap: 10,
  },
  internalContainer: { alignItems: "center" },
  fieldsWrapper: { flex: 1, gap: 10 },
  formItem: { alignItems: "center" },
  formItemLabel: {
    width: 50,
    fontSize: 14,
    marginRight: 10,
  },
  extraFieldFormItemLabel: {
    width: 180,
  },
  accuracyFormItem: {
    alignItems: "baseline",
  },
  numericTextInput: {
    flex: 1,
    maxWidth: 180,
    alignSelf: "stretch",
  },
  accuracyField: {
    fontSize: 18,
  },
  textInputNotApplicable: {
    backgroundColor: "lightgray",
  },
  showCompassButton: {
    alignSelf: "center",
    margin: 20,
  },
});
