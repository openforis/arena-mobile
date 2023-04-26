import React, {useState} from 'react';
import {View, TextInput} from 'react-native';

import {TouchableIcon} from '../TouchableIcons';

import styles from './styles';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

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
      <TextBase>{title}</TextBase>

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
