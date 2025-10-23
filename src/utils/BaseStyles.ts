import { StyleSheet } from "react-native";

const flexDirectionRowReverse = { flexDirection: "row-reverse" };

const flexOne = { flex: 1 };

const fullWidth = { width: "100%" };

const fullHeight = { height: "100%" };

const mirrorX = { transform: [{ scaleX: -1 }] };

export const BaseStyles = StyleSheet.create({
  // @ts-expect-error TS(2322): Type '{ flexDirection: string; }' is not assignabl... Remove this comment to see the full error message
  flexDirectionRowReverse,
  flexOne,
  // @ts-expect-error TS(2322): Type '{ width: string; }' is not assignable to typ... Remove this comment to see the full error message
  fullWidth,
  // @ts-expect-error TS(2322): Type '{ height: string; }' is not assignable to ty... Remove this comment to see the full error message
  fullHeight,
  fullWidthAndHeight: {
    ...fullWidth,
    // @ts-expect-error TS(2322): Type '{ fullHeight: { height: string; }; width: st... Remove this comment to see the full error message
    fullHeight,
  },
  mirrorX,
});
