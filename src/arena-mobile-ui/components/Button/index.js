import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

import styles from './styles';

const Button = ({onPress = null, label, type = 'primary', ...props}) => {
  return (
    <TouchableOpacity
      style={[styles.base, styles[type]]}
      onPress={onPress}
      {...props}>
      <Text style={[styles.text.base, styles.text[type]]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;
