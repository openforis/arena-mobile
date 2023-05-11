import React from 'react';
import {TouchableOpacity} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

const ListItem = ({label, handlePress, selected}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, selected ? styles.selectedItem : {}]}>
      <TextBase customStyle={selected ? styles.selectedItem : {}}>
        {label}
      </TextBase>
    </TouchableOpacity>
  );
};

export default ListItem;
