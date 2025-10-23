import { StyleSheet } from "react-native";
// @ts-expect-error TS(2307): Cannot find module 'utils/BaseStyles' or its corre... Remove this comment to see the full error message
import { BaseStyles } from "utils/BaseStyles";

export default StyleSheet.create({
  scrollView: { flex: 1, display: "flex", width: "100%" },
  scrollViewRtl: BaseStyles.mirrorX,
  scrollViewContent: { flexDirection: "row" },
  item: { alignItems: "center", width: "auto" },
  itemRtl: BaseStyles.mirrorX,
  itemButton: { maxWidth: 230 },
});
