import React from 'react';
import {TouchableOpacity} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

const ListItem = ({label, handlePress, selected, icon}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, selected ? styles.selectedItem : {}]}>
      {icon && <Icon name={icon} size="s" />}
      <TextBase customStyle={selected ? styles.selectedItem : {}}>
        {label}
      </TextBase>
    </TouchableOpacity>
  );
};

export default ListItem;
