import { StyleSheet } from "react-native";
import { BaseStyles } from "utils/BaseStyles";

export default StyleSheet.create({
  scrollView: { flex: 1, display: "flex", width: "100%" },
  scrollViewRtl: BaseStyles.mirrorX,
  scrollViewContent: { flexDirection: "row" },
  item: { alignItems: "center", width: "auto" },
  itemRtl: BaseStyles.mirrorX,
  itemButton: { maxWidth: 230, },
  itemButtonLabel: { flexShrink: 1 },
  completionContainer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    width: "100%",
  },
  completionProgressBar: { height: 6, margin: 0, borderRadius: 3 },
  completionText: { opacity: 0.7, marginTop: 2 },
});
