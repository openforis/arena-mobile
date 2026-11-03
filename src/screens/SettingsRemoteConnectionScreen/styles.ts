import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 10,
  },
  offlineBanner: {
    alignItems: "center",
    borderRadius: 8,
    gap: 10,
    padding: 12,
  },
  cardContent: { alignItems: "center", gap: 12, paddingVertical: 20 },
  logo: { width: 64, height: 64 },
  textInput: { alignSelf: "stretch" },
  forgotPasswordLink: { alignSelf: "flex-end", padding: 0 },
  buttonBar: { alignItems: "center", justifyContent: "space-between" },
  goBackButton: { margin: 0, height: 40, width: 100 },
  loginButtonLabel: { fontSize: 18 },
  centeredButton: { alignSelf: "center" },
  serverUrlRow: { alignItems: "center", gap: 8 },
  serverUrlTextInput: { flex: 1 },
  requestAccessLink: { alignSelf: "center" },
});
