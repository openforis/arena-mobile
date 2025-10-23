import React from "react";
import { Checkbox as RNPCheckbox } from "react-native-paper";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  base: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export const Checkbox = (props) => {
  const { checked, disabled, label, onPress, style: styleProp } = props;

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

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
};
