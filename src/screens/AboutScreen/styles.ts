import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screenContent: {
    gap: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 16,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  appName: {
    textAlign: "center",
  },
  section: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    paddingBottom: 0,
  },
  listItem: {
    paddingVertical: 4,
  },
  footer: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    paddingTop: 8,
  },
  footerLink: {
    padding: 0,
  },
});
