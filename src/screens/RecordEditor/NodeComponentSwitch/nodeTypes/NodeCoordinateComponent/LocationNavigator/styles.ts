import { StyleSheet } from "react-native";

export const loadingOverlayAbsoluteStyle = StyleSheet.flatten([
  StyleSheet.absoluteFill,
  { justifyContent: "center" as const, alignItems: "center" as const },
]);

export default StyleSheet.create({
  // ── Portrait layout ────────────────────────────────────────────────────
  container: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  compassWrapper: {
    alignItems: "center",
    marginVertical: 6,
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
    gap: 6,
    marginVertical: 2,
  },
  infoCard: {
    width: 140,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  infoCardLabel: {
    width: "100%",
    textAlign: "center",
    marginBottom: 2,
  },
  infoCardValue: {
    textAlign: "center",
  },
  coordsSection: {
    width: "100%",
    gap: 2,
    marginVertical: 2,
  },
  buttonRow: {
    justifyContent: "center",
    marginTop: 4,
  },
  switchesSection: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
  },
  switchesInfoButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  switchesStack: {
    flex: 1,
    gap: 4,
  },
});
