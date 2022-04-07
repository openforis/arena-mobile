import React, {useState} from 'react';
import {Text, View, TextInput} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import {TouchableIcon} from '../TouchableIcons';

import styles from './styles';

const icons = {
  passwordVisible: 'eye-outline',
  passwordHidden: 'eye-off-outline',
};

const PasswordInput = ({title, autoFocus = false, ...otherProps}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisible = () => {
    setPasswordVisible(!passwordVisible);
  };

  const rightIcon = passwordVisible
    ? icons.passwordVisible
    : icons.passwordHidden;

  return (
    <View style={styles.container}>
      <Text style={[baseStyles.textStyle.text]}>{title}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          autoFocus={autoFocus}
          selectTextOnFocus={true}
          secureTextEntry={!passwordVisible}
          {...otherProps}
        />
        <TouchableIcon onPress={togglePasswordVisible} iconName={rightIcon} />
      </View>
    </View>
  );
};

export default PasswordInput;
