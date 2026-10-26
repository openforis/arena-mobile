import React, { forwardRef, Ref, useMemo } from "react";
import { TextInput as RNPTextInput, useTheme } from "react-native-paper";
import {
  KeyboardTypeOptions,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from "react-native";

import { useTranslation } from "localization";

const multilineStyle = { lineHeight: 24 };

type Props = {
  autoFocus?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  defaultValue?: any;
  disabled?: boolean;
  editable?: boolean;
  error?: boolean;
  inputMode?: TextInputProps["inputMode"];
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  // when false, label and placeholder are shown as they are (not translated)
  labelIsI18nKey?: boolean;
  nonEditableStyleVisible?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  onChange?: (text: string) => void;
  onPressIn?: () => void;
  onSubmitEditing?: () => void;
  right?: React.ReactNode;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  value?: string;
};

export const TextInput = forwardRef(function TextInput(
  props: Props,
  ref: Ref<any>,
) {
  const {
    autoCapitalize = "none",
    autoFocus,
    disabled = false,
    editable = true,
    error = false,
    inputMode,
    keyboardType,
    label: labelKey,
    labelIsI18nKey = true,
    nonEditableStyleVisible = true,
    multiline = false,
    numberOfLines,
    placeholder: placeholderKey,
    onChange,
    onPressIn,
    onSubmitEditing,
    right,
    secureTextEntry,
    style: styleProp = {},
    testID,
    value,
    ...otherProps
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const showAsReadOnly = !editable && nonEditableStyleVisible;

  const label = labelIsI18nKey ? t(labelKey) : labelKey;
  const placeholder = labelIsI18nKey ? t(placeholderKey) : placeholderKey;

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
      autoFocus={autoFocus}
      disabled={disabled}
      editable={editable}
      error={error}
      inputMode={inputMode}
      keyboardType={keyboardType}
      label={label}
      mode="outlined"
      multiline={multiline}
      numberOfLines={numberOfLines}
      onChangeText={onChange}
      onPressIn={onPressIn}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      ref={ref}
      right={right}
      secureTextEntry={secureTextEntry}
      style={style}
      textColor={textColor}
      testID={testID}
      theme={theme}
      value={value}
      {...otherProps}
    />
  );
});
