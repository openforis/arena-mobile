import React from 'react';
import {TouchableOpacity} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const OptionChip = ({
  iconName,
  onPressIcon = false,
  isActive = false,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chipContainer({isActive})]}>
      <TextBase customStyle={[styles.label({isActive})]}>{label}</TextBase>
      {iconName && onPressIcon && (
        <TouchableIcon
          onPress={onPressIcon}
          hitSlop={baseStyles.bases.BASE_6}
          size={baseStyles.bases.BASE_4}
          customStyle={[styles.icon({isActive})]}
          iconName={iconName}
        />
      )}
    </TouchableOpacity>
  );
};

export default OptionChip;
