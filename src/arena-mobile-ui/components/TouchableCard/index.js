import React from 'react';
import {TouchableOpacity} from 'react-native';

import styles from './styles';

const TouchableCard = ({onPress, children, customStyles = {}, ...props}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, customStyles]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default TouchableCard;
