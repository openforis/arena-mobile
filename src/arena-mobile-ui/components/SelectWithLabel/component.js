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
  labelExtractor,
}) => {
  const styles = useThemedStyles(_styles);
  return (
    <View style={styles.container}>
      <Label size="m" label={label} />
      <Select
        items={items}
        labelExtractor={labelExtractor}
        onValueChange={handleChange}
        selectedItemKey={selectedItemKey}
        theme="neutral"
      />
    </View>
  );
};

SelectWithLabel.defaultProps = {
  labelExtractor: undefined,
};

export default SelectWithLabel;
