import React from 'react';
import {View} from 'react-native';

import Attributes from '../common/Attributes';
import EntityPanel from '../common/EntityPanel';

import styles from './styles';

const Entity = () => {
  return (
    <View style={[styles.container]}>
      <Attributes />
      <EntityPanel />
    </View>
  );
};

export default Entity;
