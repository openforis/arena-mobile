import React, {useMemo} from 'react';
import {Text, StyleSheet} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import Pressable from '../Pressable';

import _styles from './styles';

const Button = ({
  onPress,
  label,
  type,
  disabled,
  icon,
  customContainerStyle,
  customTextStyle,
  iconPosition,
  allowMultipleLines,
  bold,
  ...props
}) => {
  const styles = useThemedStyles(_styles);
  const containerStyles = useMemo(() => {
    return StyleSheet.compose(
      styles.base,
      styles[type],
      disabled && (styles?.disabled?.[type] || {}),
      customContainerStyle,
    );
  }, [styles, type, disabled, customContainerStyle]);

  const textStyles = useMemo(() => {
    return StyleSheet.compose(
      bold && styles.bold,
      styles.baseText,
      styles.text[type],
      (disabled && styles.disabled.text[type]) || {},
    ).concat(customTextStyle);
  }, [styles, type, disabled, customTextStyle, bold]);

  return (
    <Pressable
      style={containerStyles}
      onPress={onPress}
      disabled={disabled}
      {...props}>
      {iconPosition === 'left' && icon}
      <Text numberOfLines={allowMultipleLines ? null : 1} style={textStyles}>
        {label}
      </Text>
      {iconPosition === 'right' && icon}
    </Pressable>
  );
};

Button.defaultProps = {
  onPress: null,
  label: '',
  type: 'primary',
  disabled: false,
  icon: null,
  customContainerStyle: {},
  customTextStyle: {},
  iconPosition: 'left',
  allowMultipleLines: false,
  bold: true,
};

export default Button;
