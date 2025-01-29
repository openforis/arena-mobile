import { StyleSheet } from "react-native";
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
