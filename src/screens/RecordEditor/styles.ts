import { StyleSheet } from "react-native";
// @ts-expect-error TS(2307): Cannot find module 'utils/BaseStyles' or its corre... Remove this comment to see the full error message
import { BaseStyles } from "utils/BaseStyles";

const internalContainerWrapperInTablet = {
  ...BaseStyles.fullWidthAndHeight,
};

export default StyleSheet.create({
  externalContainerInTablet: {
    flex: 1,
  },
  drawerWrapperInTablet: {
    ...BaseStyles.fullHeight,
    width: "45%",
  },
  internalContainerWrapperInTablet: {
    flex: 1,
  },
  internalContainerWrapperInTabletPageSelectorOpen: {
    ...internalContainerWrapperInTablet,
    width: "55%",
  },
  internalContainer: {
    flex: 1,
  },
});
