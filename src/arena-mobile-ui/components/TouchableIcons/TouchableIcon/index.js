import React from 'react';
import {TouchableOpacity} from 'react-native';

import Icon from '../../Icon';

const TouchableIcon = ({
  onPress,
  iconName,
  size = 24,
  customStyle = {},
  iconColor = null,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[customStyle]}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
      <Icon name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

export default TouchableIcon;
