import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Icon = ({name, size = 24, color = null}) => {
  return <Ionicons name={name} size={size} color={color} />;
};

export default Icon;
