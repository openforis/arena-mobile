import React from 'react';
import {View} from 'react-native';

import styles from './styles';
import TableOption from '../../../common/EntityPanel/TableOption';

const Viewtoggler = () => {
  return (
    <View style={styles.container}>
      <View />
      <TableOption withIcon={true} />
    </View>
  );
};

export default Viewtoggler;
