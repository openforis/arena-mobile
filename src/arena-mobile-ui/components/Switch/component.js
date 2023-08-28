import React from 'react';
import {StyleSheet} from 'react-native';
import {Switch} from 'react-native-elements';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const SwitchComponent = ({
  title,
  value,
  onValueChange,
  customContainerStyle,
  disabled,
}) => {
  const styles = useThemedStyles(_styles);

  const containerStyles = React.useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.container, customContainerStyle),
      disabled && styles.disabled,
    );
  }, [styles, customContainerStyle, disabled]);

  const textStyles = React.useMemo(() => {
    return StyleSheet.compose(
      styles.textStyle,
      disabled ? styles.disabledText : {},
    );
  }, [styles, disabled]);

  return (
    <Pressable
      onPress={onValueChange}
      style={containerStyles}
      disabled={disabled}>
      <TextBase type="header" customStyle={textStyles}>
        {title}
      </TextBase>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color="green"
        disabled={disabled}
      />
    </Pressable>
  );
};

export default SwitchComponent;
