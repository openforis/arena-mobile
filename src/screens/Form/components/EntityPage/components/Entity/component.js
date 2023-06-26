import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import Attributes from '../common/Attributes';
import EntityPanel from '../common/EntityPanel';

import _styles from './styles';

const Entity = () => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={[styles.container]}>
      <Attributes />
      <EntityPanel />
    </View>
  );
};

export default Entity;
