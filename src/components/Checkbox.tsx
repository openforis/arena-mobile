import React from "react";
import { Checkbox as RNPCheckbox } from "react-native-paper";
import { StyleSheet } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  base: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export const Checkbox = (props: any) => {
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
