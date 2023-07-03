import React from 'react';

import Icon from '../../Icon';
import Pressable from '../../Pressable';

const TouchableIcon = ({
  onPress,
  iconName,
  size,
  customStyle,
  iconColor,
  hitSlop,
}) => {
  if (!iconName) {
    return null;
  }
  return (
    <Pressable onPress={onPress} style={customStyle} hitSlop={hitSlop}>
      <Icon name={iconName} size={size} color={iconColor} />
    </Pressable>
  );
};

TouchableIcon.defaultProps = {
  onPress: () => {},
  iconName: false,
  size: 'm',
  customStyle: {},
  iconColor: null,
  hitSlop: 20,
};

export default TouchableIcon;
