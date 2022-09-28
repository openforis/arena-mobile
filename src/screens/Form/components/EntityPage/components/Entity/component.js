import React from 'react';
import {View} from 'react-native';

import Attributes from '../common/Attributes';
import EntityNavigation from '../common/EntityNavigation';
import MultipleEntityManager from '../common/MultipleEntityManager';

import styles from './styles';

const Entity = () => {
  return (
    <View style={[styles.container]}>
      <MultipleEntityManager />
      <Attributes />
      <EntityNavigation />
    </View>
  );
};

export default Entity;
