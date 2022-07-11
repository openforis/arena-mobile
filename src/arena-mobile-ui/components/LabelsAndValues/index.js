import React from 'react';
import {View, Text} from 'react-native';

import baseStyles from '../../styles';

import styles from './styles';

export const Label = ({label, size = 's'}) => (
  <Text
    style={[
      baseStyles.textStyle.secondaryText,
      baseStyles.textStyle.bold,
      baseStyles.textSize[size],
    ]}>
    {label}:
  </Text>
);

export const Value = ({label, size = 's'}) => (
  <Text style={[baseStyles.textStyle.secondaryText, baseStyles.textSize[size]]}>
    {label}
  </Text>
);

const LabelsAndValues = ({items, size, expanded = false}) => (
  <View style={[styles.container]}>
    <View style={[styles.labels({expanded})]}>
      {items.map(({label}) => (
        <Label key={label} label={label} size={size} />
      ))}
    </View>
    <View style={[styles.values({expanded})]}>
      {items.map(({label, value}) => (
        <Value key={label} label={value} size={size} />
      ))}
    </View>
  </View>
);

export default LabelsAndValues;
