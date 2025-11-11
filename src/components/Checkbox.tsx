import React from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Checkbox as RNPCheckbox } from "react-native-paper";

import { useTranslation } from "localization";

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
  labelIsI18nKey?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Checkbox = (props: Props) => {
  const {
    checked,
    disabled,
    label: labelProp = "",
    labelIsI18nKey = true,
    labelStyle,
    onPress,
    style: styleProp,
  } = props;

  const { t } = useTranslation();

  const label = labelIsI18nKey ? t(labelProp) : labelProp;

  return (
    <RNPCheckbox.Item
      disabled={disabled}
      label={label}
      labelStyle={labelStyle}
      mode="android"
      onPress={onPress}
      status={checked ? "checked" : "unchecked"}
      style={[styles.base, styleProp]}
    />
  );
};
