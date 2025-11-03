import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

import { Text } from "../Text";
import { View } from "../View";

import styles from "./styles";

type Props = {
  headerKey?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const FieldSet = (props: Props) => {
  const { headerKey, style, children } = props;

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
        style={[styles.legend, { backgroundColor: theme.colors.surface }]}
        textKey={headerKey}
      />
      {children}
    </View>
  );
};
