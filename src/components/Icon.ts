import { useTheme } from "react-native-paper";
import RNPIcon from "react-native-paper/src/components/Icon";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const Icon = (props: any) => {
  const { color: colorProp = undefined, size = 20, source } = props;
  const theme = useTheme();
  const color = colorProp ?? theme.colors.onBackground;
  // @ts-expect-error TS(7027): Unreachable code detected.
  return <RNPIcon color={color} size={size} source={source} />;
};

Icon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  source: PropTypes.string.isRequired,
};

Icon.defaultProps = {
  size: 20,
};
