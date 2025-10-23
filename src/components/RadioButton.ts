import { RadioButton as RNPRadioButton } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const RadioButton = (props: any) => {
  const { checked, disabled, label, onPress, style, value } = props;

  return (
    // @ts-expect-error TS(2503): Cannot find namespace 'RNPRadioButton'.
    <RNPRadioButton.Item
      disabled={disabled}
      // @ts-expect-error TS(7027): Unreachable code detected.
      label={label}
      // @ts-expect-error TS(2304): Cannot find name 'mode'.
      mode="android"
      // @ts-expect-error TS(2588): Cannot assign to 'onPress' because it is a constan... Remove this comment to see the full error message
      onPress={onPress}
      // @ts-expect-error TS(2304): Cannot find name 'status'.
      status={checked ? "checked" : "unchecked"}
      // @ts-expect-error TS(2588): Cannot assign to 'style' because it is a constant.
      style={[{ paddingVertical: 0, paddingHorizontal: 0 }, style]}
      // @ts-expect-error TS(2588): Cannot assign to 'value' because it is a constant.
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
