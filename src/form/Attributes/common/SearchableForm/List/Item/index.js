import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import styles from './styles';

const ListItem = ({label, handlePress, selected}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, selected ? styles.selectedItem : {}]}>
      <Text style={selected ? styles.selectedItem : {}}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ListItem;
