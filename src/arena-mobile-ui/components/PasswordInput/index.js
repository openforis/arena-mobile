import React, {useState} from 'react';
import {View, TextInput} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {TouchableIcon} from '../TouchableIcons';

import _styles from './styles';

const icons = {
  visible: 'eye-outline',
  hidden: 'eye-off-outline',
};

const PasswordInput = ({title, autoFocus = false, ...otherProps}) => {
  const styles = useThemedStyles(_styles);
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  const rightIcon = visible ? icons.visible : icons.hidden;

  return (
    <View style={styles.container}>
      <TextBase>{title}</TextBase>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          autoFocus={autoFocus}
          selectTextOnFocus={true}
          secureTextEntry={!visible}
          {...otherProps}
        />
        <TouchableIcon onPress={toggleVisible} iconName={rightIcon} />
      </View>
    </View>
  );
};

export default PasswordInput;
