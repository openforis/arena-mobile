import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const Button = ({
  onPress = null,
  label,
  type = 'primary',
  disabled = false,
  icon = null,
  customContainerStyle = {},
  customTextStyle = {},
  iconPosition = 'left',
  allowMultipleLines = false,
  bold = true,
  ...props
}) => {
  const styles = useThemedStyles(_styles);
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[type],
        (disabled && styles.disabled[type]) || {},
        customContainerStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}>
      {iconPosition === 'left' && icon}
      <Text
        numberOfLines={allowMultipleLines ? null : 1}
        style={[
          bold && styles.bold,
          styles.baseText,
          styles.text[type],
          (disabled && styles.disabled.text[type]) || {},
          customTextStyle,
        ]}>
        {label}
      </Text>
      {iconPosition === 'right' && icon}
    </TouchableOpacity>
  );
};

export default Button;
