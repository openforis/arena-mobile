import { RadioButton as RNPRadioButton } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  value?: string;
};

export const RadioButton = (props: Props) => {
  const { checked, disabled, label = "", onPress, style, value = "" } = props;

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
