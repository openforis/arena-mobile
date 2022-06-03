import React from 'react';
import {View} from 'react-native';

import Attributes from './components/Attributes';
import MultipleEntityManager from './components/MultipleEntityManager';
import styles from './styles';

const Entity = () => {
  return (
    <View style={[styles.container]}>
      <MultipleEntityManager />
      <Attributes />
    </View>
  );
};

export default Entity;
