import { RadioButton as RNPRadioButton } from "react-native-paper";
import PropTypes from "prop-types";

export const RadioButton = (props) => {
  const { checked, disabled, label, onPress, style, value } = props;

  return (
    <RNPRadioButton.Item
      disabled={disabled}
      label={label}
      mode="android"
      onPress={onPress}
      status={checked ? "checked" : "unchecked"}
      style={[{ paddingVertical: 0, paddingHorizontal: 0 }, style]}
      value={value}
    />
  );
};

RadioButton.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onPress: PropTypes.func,
  style: PropTypes.object,
  value: PropTypes.string,
};
