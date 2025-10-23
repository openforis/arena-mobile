import { useTheme } from "react-native-paper";
import RNPIcon from "react-native-paper/src/components/Icon";
import PropTypes from "prop-types";

export const Icon = (props) => {
  const { color: colorProp = undefined, size = 20, source } = props;
  const theme = useTheme();
  const color = colorProp ?? theme.colors.onBackground;
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
