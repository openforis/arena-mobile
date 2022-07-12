import React, {useMemo} from 'react';
import {TouchableOpacity, Text, useColorScheme} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

import _styles from './styles';

const useThemedStyles = ({styles}) => {
  const colorScheme = useColorScheme();
  const themedStyles = useMemo(() => {
    const themedColors = colors.themes[colorScheme] || {};
    const _colors = Object.assign({}, colors, themedColors);
    return styles({colors: _colors});
  }, [colorScheme, styles]);
  return themedStyles;
};

const Button = ({
  onPress = null,
  label,
  type = 'primary',
  disabled = false,
  icon = null,
  customContainerStyle = {},
  customTextStyle = {},
  ...props
}) => {
  const styles = useThemedStyles({styles: _styles});
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
      {icon}
      <Text
        style={[
          baseStyles.textStyle.bold,
          styles.text[type],
          (disabled && styles.disabled.text[type]) || {},
          customTextStyle,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
