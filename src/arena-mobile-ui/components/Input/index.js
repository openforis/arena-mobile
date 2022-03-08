import React from 'react';
import {Text, View, TextInput} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const Input = ({
  onChange,
  onChangeText,
  title,
  autoFocus = false,
  ...props
}) => {
  return (
    <View>
      <Text style={[baseStyles.textStyle.text]}>{title}</Text>
      <TextInput
        style={styles.input}
        onChange={onChange}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        selectTextOnFocus={true}
        {...props}
      />
    </View>
  );
};

export default Input;
