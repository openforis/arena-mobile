import React, { forwardRef, Ref, useMemo } from "react";
import { TextInput as RNPTextInput, useTheme } from "react-native-paper";
import { StyleProp, ViewStyle, KeyboardTypeOptions } from "react-native";

import { useTranslation } from "localization";

const multilineStyle = { lineHeight: 24 };

type Props = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  defaultValue?: any;
  disabled?: boolean;
  editable?: boolean;
  error?: boolean;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  nonEditableStyleVisible?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  onChange?: (text: string) => void;
  onPressIn?: () => void;
  right?: React.ReactNode;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  value?: string;
};

export const TextInput = forwardRef(function TextInput(
  props: Props,
  ref: Ref<any>
) {
  const {
    autoCapitalize = "none",
    disabled = false,
    editable = true,
    error = false,
    keyboardType,
    label: labelKey,
    nonEditableStyleVisible = true,
    multiline = false,
    numberOfLines,
    placeholder: placeholderKey,
    onChange,
    onPressIn,
    right,
    secureTextEntry,
    style: styleProp = {},
    value,
    ...otherProps
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const showAsReadOnly = !editable && nonEditableStyleVisible;

  const label = t(labelKey);
  const placeholder = t(placeholderKey);

  const style = useMemo(() => {
    return [
      ...(multiline ? [multilineStyle] : []),
      ...(showAsReadOnly
        ? [{ backgroundColor: theme.colors.surfaceVariant }]
        : []),
      styleProp,
    ];
  }, [multiline, showAsReadOnly, styleProp, theme.colors.surfaceVariant]);

  const textColor = showAsReadOnly ? theme.colors.onSurfaceVariant : undefined;

  return (
    <RNPTextInput
      autoCapitalize={autoCapitalize}
      disabled={disabled}
      editable={editable}
      error={error}
      keyboardType={keyboardType}
      label={label}
      mode="outlined"
      multiline={multiline}
      numberOfLines={numberOfLines}
      onChangeText={onChange}
      onPressIn={onPressIn}
      placeholder={placeholder}
      ref={ref}
      right={right}
      secureTextEntry={secureTextEntry}
      style={style}
      textColor={textColor}
      theme={theme}
      value={value}
      {...otherProps}
    />
  );
});
