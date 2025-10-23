import { RadioButton as RNPRadioButton } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const RadioButtonGroup = (props: any) => {
  const { children, onValueChange, value } = props;
  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
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
