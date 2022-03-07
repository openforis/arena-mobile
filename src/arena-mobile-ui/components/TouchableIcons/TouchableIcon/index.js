import React from 'react';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TouchableIcon = ({
  onPress,
  iconName,
  size = 24,
  customStyle = {},
  iconColor = null,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[customStyle]}>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

export default TouchableIcon;
