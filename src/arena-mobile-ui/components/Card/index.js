import React from 'react';
import {View} from 'react-native';

import styles from './styles';

const Card = ({children, type = 'primary', customStyles = {}}) => {
  return (
    <View style={[styles.container, styles[type], customStyles]}>
      {children}
    </View>
  );
};

export default Card;
