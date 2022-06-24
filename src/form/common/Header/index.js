import React from 'react';
import {View} from 'react-native';

import Label from '../Label';
import Validation from '../Validation';

import styles from './styles';

export const Header = ({nodeDef, nodes, showValidation = true}) => {
  return (
    <>
      <View style={styles.container}>
        <Label nodeDef={nodeDef} />
        <Validation
          nodeDef={nodeDef}
          nodes={nodes}
          showValidation={showValidation}
        />
      </View>
    </>
  );
};

export default Header;
