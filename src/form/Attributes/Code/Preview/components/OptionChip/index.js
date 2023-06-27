import React from 'react';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import baseStyles from 'arena-mobile-ui/styles';

import _styles from './styles';

const OptionChip = ({iconName, onPressIcon, isActive, label, onPress}) => {
  const styles = useThemedStyles(_styles);
  return (
    <Pressable onPress={onPress} style={styles.chipContainer({isActive})}>
      <TextBase customStyle={styles.label({isActive})}>{label}</TextBase>
      {iconName && onPressIcon && (
        <TouchableIcon
          onPress={onPressIcon}
          hitSlop={baseStyles.bases.BASE_6}
          size="s"
          customStyle={[styles.icon({isActive})]}
          iconName={iconName}
        />
      )}
    </Pressable>
  );
};

OptionChip.defaultProps = {
  iconName: '',
  onPressIcon: null,
  isActive: false,
  label: '',
  onPress: () => {},
};
export default OptionChip;
