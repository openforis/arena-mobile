import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  serverUrlTextInput: { flex: 1 },
  testUrlButton: {
    alignSelf: "center",
    margin: 10,
  },
  loginButtonBar: { alignItems: "center", justifyContent: "space-between" },
  goBackButton: { margin: 0, height: 40, width: 100 },
  loginButton: { margin: 20 },
  loginButtonLabel: {
    fontSize: 18,
  },
  logoutButton: {
    alignSelf: "flex-start",
  },
});
