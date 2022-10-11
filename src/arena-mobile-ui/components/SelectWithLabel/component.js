import React from 'react';
import {View} from 'react-native';

import {Label} from '../LabelsAndValues';
import Select from '../Select';

import styles from './styles';

const SelectWithLabel = ({label, handleChange, items, selectedItemKey}) => {
  return (
    <View style={[styles.container]}>
      <Label size="m" label={label} />
      <Select
        items={items}
        onValueChange={handleChange}
        selectedItemKey={selectedItemKey}
        customStyles={styles.pickerStyles}
      />
    </View>
  );
};

export default SelectWithLabel;
