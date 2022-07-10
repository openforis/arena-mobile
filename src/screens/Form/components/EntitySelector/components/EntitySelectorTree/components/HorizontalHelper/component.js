import React from 'react';
import {View} from 'react-native';

import styles from './styles';

const HorizonalHelper = ({level = 0}) => {
  return (
    <View style={[styles.container(level)]}>
      <View style={[styles.helper]} />
    </View>
  );
};

export default HorizonalHelper;
