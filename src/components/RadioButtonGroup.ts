import { RadioButton as RNPRadioButton } from "react-native-paper";
import PropTypes from "prop-types";

export const RadioButtonGroup = (props) => {
  const { children, onValueChange, value } = props;
  return (
    <RNPRadioButton.Group onValueChange={onValueChange} value={value}>
      {children}
    </RNPRadioButton.Group>
  );
};

RadioButtonGroup.propTypes = {
  children: PropTypes.node.isRequired,
  onValueChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};
