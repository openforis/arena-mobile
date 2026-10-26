import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import {
  Checkbox as RNPCheckbox,
  RadioButton as RNPRadioButton,
  TouchableRipple,
  useTheme,
} from "react-native-paper";

import { HView } from "./HView";

const styles = StyleSheet.create({
  item: { borderRadius: 8, borderWidth: 1, paddingVertical: 4 },
  itemContent: { alignItems: "center" },
});

type Props = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  // checkbox when true, radio button otherwise
  multiple?: boolean;
  onPress: () => void;
  selected: boolean;
  style?: StyleProp<ViewStyle>;
};

// bordered pressable item with a checkbox or radio button on the left, highlighted when selected
export const ChoiceItem = (props: Props) => {
  const {
    children,
    contentStyle,
    multiple = false,
    onPress,
    selected,
    style,
  } = props;

  const { colors } = useTheme();
  const status = selected ? "checked" : "unchecked";

  return (
    <TouchableRipple
      onPress={onPress}
      style={[
        styles.item,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.primary : colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
        style,
      ]}
    >
      <HView style={[styles.itemContent, contentStyle]}>
        {multiple ? (
          <RNPCheckbox.Android onPress={onPress} status={status} />
        ) : (
          <RNPRadioButton onPress={onPress} status={status} value="" />
        )}
        {children}
      </HView>
    </TouchableRipple>
  );
};
