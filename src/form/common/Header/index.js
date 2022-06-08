import React from 'react';
import {View} from 'react-native';

import Label from '../Label';

import styles from './styles';

export const Header = ({nodeDef}) => {
  return (
    <>
      <View style={styles.container}>
        <Label nodeDef={nodeDef} />
      </View>
    </>
  );
};

export default Header;
