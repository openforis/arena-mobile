import React from 'react';
import {View} from 'react-native';

import {Label} from '../LabelsAndValues';
import Select from '../Select';

import styles from './styles';

const SelectWithLabel = ({
  label,
  handleChange,
  items,
  selectedItemKey,
  labelStractor = undefined,
}) => {
  return (
    <View style={[styles.container]}>
      <Label size="m" label={label} />
      <Select
        items={items}
        labelStractor={labelStractor}
        onValueChange={handleChange}
        selectedItemKey={selectedItemKey}
        customStyles={styles.pickerStyles}
      />
    </View>
  );
};

export default SelectWithLabel;
