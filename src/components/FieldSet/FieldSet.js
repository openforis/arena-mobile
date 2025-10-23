import { useTheme } from "react-native-paper";
import PropTypes from "prop-types";

import { Text } from "../Text";
import { View } from "../View";

import styles from "./styles";

export const FieldSet = (props) => {
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

FieldSet.propTypes = {
  headerKey: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
};
