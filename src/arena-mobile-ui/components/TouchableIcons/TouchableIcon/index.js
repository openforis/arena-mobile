import React from 'react';
import {TouchableOpacity} from 'react-native';

import Icon from '../../Icon';

const TouchableIcon = ({
  onPress,
  iconName,
  size,
  customStyle = {},
  iconColor = null,
  hitSlop = 20,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[customStyle]}
      hitSlop={{top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop}}>
      <Icon name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

export default TouchableIcon;
