import React from "react";
import { Checkbox as RNPCheckbox } from "react-native-paper";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  base: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

type Props = {
  checked: boolean;
  disabled?: boolean;
  label?: string;
  onPress: () => void;
  style?: any;
};

export const Checkbox = (props: Props) => {
  const { checked, disabled, label = "", onPress, style: styleProp } = props;

  return (
    <RNPCheckbox.Item
      disabled={disabled}
      label={label}
      mode="android"
      onPress={onPress}
      status={checked ? "checked" : "unchecked"}
      style={[styles.base, styleProp]}
    />
  );
};
