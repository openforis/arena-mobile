import React, { forwardRef, useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";
import { TextInput as RNPTextInput, useTheme } from "react-native-paper";

import { useTranslation } from "localization";

const multilineStyle = { lineHeight: 24 };

export const TextInput = forwardRef(function TextInput(props, ref) {
  const {
    // @ts-expect-error TS(2339): Property 'autoCapitalize' does not exist on type '... Remove this comment to see the full error message
    autoCapitalize,
    // @ts-expect-error TS(2339): Property 'disabled' does not exist on type '{}'.
    disabled = false,
    // @ts-expect-error TS(2339): Property 'editable' does not exist on type '{}'.
    editable = true,
    // @ts-expect-error TS(2339): Property 'error' does not exist on type '{}'.
    error = false,
    // @ts-expect-error TS(2339): Property 'keyboardType' does not exist on type '{}... Remove this comment to see the full error message
    keyboardType,
    // @ts-expect-error TS(2339): Property 'label' does not exist on type '{}'.
    label: labelKey,
    // @ts-expect-error TS(2339): Property 'nonEditableStyleVisible' does not exist ... Remove this comment to see the full error message
    nonEditableStyleVisible = true,
    // @ts-expect-error TS(2339): Property 'multiline' does not exist on type '{}'.
    multiline = false,
    // @ts-expect-error TS(2339): Property 'numberOfLines' does not exist on type '{... Remove this comment to see the full error message
    numberOfLines,
    // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type '{}'... Remove this comment to see the full error message
    placeholder: placeholderKey,
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type '{}'.
    onChange,
    // @ts-expect-error TS(2339): Property 'onPressIn' does not exist on type '{}'.
    onPressIn,
    // @ts-expect-error TS(2339): Property 'secureTextEntry' does not exist on type ... Remove this comment to see the full error message
    secureTextEntry,
    // @ts-expect-error TS(2339): Property 'style' does not exist on type '{}'.
    style: styleProp = {},
    // @ts-expect-error TS(2339): Property 'value' does not exist on type '{}'.
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
      // @ts-expect-error TS(2322): Type 'ForwardedRef<unknown>' is not assignable to ... Remove this comment to see the full error message
      ref={ref}
      secureTextEntry={secureTextEntry}
      style={style}
      textColor={textColor}
      theme={theme}
      value={value}
      {...otherProps}
    />
  );
});

TextInput.propTypes = {
  autoCapitalize: PropTypes.string,
  disabled: PropTypes.bool,
  editable: PropTypes.bool,
  error: PropTypes.bool,
  keyboardType: PropTypes.string,
  label: PropTypes.string,
  nonEditableStyleVisible: PropTypes.bool,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onPressIn: PropTypes.func,
  secureTextEntry: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  value: PropTypes.string,
};
