import React from 'react';
import {View} from 'react-native';

import styles from './styles';

const VerticalHelper = () => {
  return (
    <View style={[styles.container]}>
      <View style={[styles.helper]} />

      <View style={[styles.divider]} />
    </View>
  );
};

export default VerticalHelper;
