import { useTheme } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Text } from "../Text";
import { View } from "../View";

import styles from "./styles";

export const FieldSet = (props: any) => {
  const { headerKey, style, children } = props;

  const theme = useTheme();

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'View' as a type.
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.onBackground },
        style,
      ]}
    >
      <Text
        // @ts-expect-error TS(7027): Unreachable code detected.
        style={[styles.legend, { backgroundColor: theme.colors.surface }]}
        // @ts-expect-error TS(2304): Cannot find name 'textKey'.
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
