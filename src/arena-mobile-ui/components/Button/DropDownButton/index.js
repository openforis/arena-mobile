import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import Button from '../index';

import _styles from './styles';

const ChevronDown = <Icon name="chevron-down" />;

const CodeNodeDropdown = ({label, onPress, disabled, selected}) => {
  const styles = useThemedStyles(_styles);

  const customTextStyle = useMemo(
    () => StyleSheet.compose(styles.text, selected ? styles.selected : {}),
    [styles, selected],
  );

  const customContainerStyle = useMemo(
    () =>
      StyleSheet.compose(
        styles.containerStyle,
        disabled ? styles.disabled : {},
      ),
    [styles, disabled],
  );

  return (
    <Button
      onPress={onPress}
      type="secondary"
      iconPosition="right"
      label={label}
      icon={ChevronDown}
      customContainerStyle={customContainerStyle}
      customTextStyle={customTextStyle}
      disabled={disabled}
    />
  );
};

export default CodeNodeDropdown;
