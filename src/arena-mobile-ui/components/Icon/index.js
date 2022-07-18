import React from 'react';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = ({name, size = 24, color = null}) => {
  return <Icons name={name} size={size} color={color} />;
};

export default Icon;
