import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export const useStyles = ({
  wrapperStyle
}: any) => {
  const theme = useTheme();

  return StyleSheet.create({
    // @ts-expect-error TS(2322): Type 'StyleProp<ViewStyle | TextStyle | ImageStyle... Remove this comment to see the full error message
    wrapper: StyleSheet.compose([
      {
        width: "100%",
      },
      wrapperStyle,
    ]),
    textInput: {
      display: "flex",
      flex: 1,
      alignSelf: "stretch",
    },
    notApplicable: {
      backgroundColor: theme.colors.surfaceVariant,
      color: theme.colors.onSurfaceVariant,
    },
  });
};
