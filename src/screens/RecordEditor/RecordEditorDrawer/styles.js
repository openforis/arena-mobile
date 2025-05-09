import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { DeviceInfoSelectors } from "state/deviceInfo";

export const useStyles = () => {
  const theme = useTheme();
  const isPhone = DeviceInfoSelectors.useIsPhone();

  return StyleSheet.create({
    container: {
      flex: determineContainerFlex({ isPhone }),
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderWidth: 1,
      gap: 10,
    },
    titleContainer: {
      backgroundColor: "transparent",
      alignItems: "center",
      borderBottomWidth: 2,
    },
    titleText: {
      flex: 1,
    },
    closeButton: {},
    buttonBar: {
      alignItems: "center",
      borderTopWidth: 1,
      justifyContent: "space-between",
      paddingTop: 4,
      width: "100%",
    },
  });
};
const determineContainerFlex = ({ isPhone = true }) => (isPhone ? 0.78 : 1);
