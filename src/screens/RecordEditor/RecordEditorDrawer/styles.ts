import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { DeviceInfoSelectors } from "state/deviceInfo";

const determineContainerFlex = ({ isPhone = true }) => (isPhone ? 0.9 : 1);

export const useStyles = () => {
  const theme = useTheme();
  const isPhone = DeviceInfoSelectors.useIsPhone();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: determineContainerFlex({ isPhone }),
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 1,
          gap: 10,
          marginTop: 40,
          paddingVertical: 4,
          paddingHorizontal: 10,
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
      }),
    [isPhone, theme]
  );
};
