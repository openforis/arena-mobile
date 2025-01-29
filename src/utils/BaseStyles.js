import { StyleSheet } from "react-native";

const flexDirectionRowReverse = { flexDirection: "row-reverse" };

const flexOne = { flex: 1 };

const fullWidth = { width: "100%" };

const fullHeight = { height: "100%" };

const mirrorX = { transform: [{ scaleX: -1 }] };

export const BaseStyles = StyleSheet.create({
  flexDirectionRowReverse,
  flexOne,
  fullWidth,
  fullHeight,
  fullWidthAndHeight: {
    ...fullWidth,
    fullHeight,
  },
  mirrorX,
});
