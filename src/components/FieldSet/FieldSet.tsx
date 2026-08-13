import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

import { Text } from "../Text";
import { View } from "../View";

import styles from "./styles";

type Props = {
  headerKey?: string;
  headerStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const FieldSet = (props: Props) => {
  const { headerKey, headerStyle, style, children } = props;

  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.onBackground },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.legend,
          { backgroundColor: theme.colors.surface },
          headerStyle,
        ]}
        textKey={headerKey}
      />
      {children}
    </View>
  );
};
