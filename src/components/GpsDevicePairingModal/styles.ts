import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  scanForDevicesButton: {
    alignSelf: "center",
  },
  messageContainer: {
    gap: 12,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  scanningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recognizedDevicesNotice: {
    opacity: 0.8,
  },
  pairedDevicesSection: {
    gap: 4,
  },
});
