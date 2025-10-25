import { StyleSheet } from "react-native";

const flexDirectionRowReverse = { flexDirection: "row-reverse" as const };

const flexOne = { flex: 1 as const };

const fullWidth = { width: "100%" as const };

const fullHeight = { height: "100%" as const };

const mirrorX = { transform: [{ scaleX: -1 as const }] };

export const BaseStyles = StyleSheet.create({
  flexDirectionRowReverse,
  flexOne,
  fullWidth,
  fullHeight,
  fullWidthAndHeight: {
    ...fullWidth,
    ...fullHeight,
  },
  mirrorX,
});
