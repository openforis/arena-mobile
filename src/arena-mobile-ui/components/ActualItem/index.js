import React from 'react';
import {View, Text} from 'react-native';

import styles from './styles';

const ActualItem = ({label}) => {
  return (
    <View style={[styles.container]}>
      <Text style={[styles.text]}>{label}</Text>
    </View>
  );
};

export default ActualItem;
