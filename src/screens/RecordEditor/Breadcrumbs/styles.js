import { StyleSheet } from "react-native";
import { BaseStyles } from "utils/BaseStyles";

export default StyleSheet.create({
  scrollView: {
    flex: 1,
    display: "flex",
    width: "100%",
  },
  scrollViewRtl: BaseStyles.mirrorX,
  scrollViewContent: {
    flexDirection: "row",
  },
  item: { alignItems: "center", width: "auto" },
  itemRtl: BaseStyles.mirrorX,
  itemButton: { maxWidth: 230 },
  itemButtonLabel: { fontSize: 20 },
});
