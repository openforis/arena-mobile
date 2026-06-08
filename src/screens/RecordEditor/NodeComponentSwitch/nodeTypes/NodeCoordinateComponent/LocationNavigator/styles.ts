import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // ── Portrait layout ────────────────────────────────────────────────────
  container: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  compassWrapper: {
    alignItems: "center",
    marginVertical: 12,
  },

  // ── Landscape layout ───────────────────────────────────────────────────
  containerLandscape: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  compassColumnLandscape: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  infoColumnLandscape: {
    flex: 1,
  },
  infoColumnContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  // ── Shared ─────────────────────────────────────────────────────────────
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  warning: {
    color: "#f44336",
    marginBottom: 4,
    textAlign: "center",
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginVertical: 4,
  },
  infoCard: {
    width: 136,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  infoCardLabel: {
    opacity: 0.65,
    textAlign: "center",
    marginBottom: 2,
  },
  infoCardValue: {
    textAlign: "center",
  },
  coordsSection: {
    width: "100%",
    gap: 4,
    marginVertical: 4,
  },
  buttonRow: {
    justifyContent: "center",
    marginTop: 8,
  },
});
