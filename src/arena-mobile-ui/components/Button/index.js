import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const Button = ({
  onPress = null,
  label,
  type = 'primary',
  disabled = false,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[type],
        (disabled && styles.disabled[type]) || {},
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}>
      <Text
        style={[
          baseStyles.textStyle.bold,
          styles.text[type],
          (disabled && styles.disabled.text[type]) || {},
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
