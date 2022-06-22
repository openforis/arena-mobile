import React from 'react';
import {View} from 'react-native';

import Label from '../Label';
import Validation from '../Validation';

import styles from './styles';

export const Header = ({nodeDef, showValidation = true}) => {
  return (
    <>
      <View style={styles.container}>
        <Label nodeDef={nodeDef} />
        {showValidation && <Validation nodeDef={nodeDef} />}
      </View>
    </>
  );
};

export default Header;
