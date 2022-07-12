import React from 'react';
import {View} from 'react-native';

import styles from './styles';

const ChipsContainer = ({children}) => (
  <View style={[styles.chipsContainer]}>{children}</View>
);

export default ChipsContainer;
