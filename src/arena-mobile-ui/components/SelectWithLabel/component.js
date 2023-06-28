import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {Label} from '../LabelsAndValues';
import Select from '../Select';

import _styles from './styles';

const SelectWithLabel = ({
  label,
  handleChange,
  items,
  selectedItemKey,
  labelStractor,
}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
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

SelectWithLabel.defaultProps = {
  labelStractor: undefined,
};

export default SelectWithLabel;
