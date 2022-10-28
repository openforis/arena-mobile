import {Objects} from '@openforis/arena-core';
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
    ]}
    numberOfLines={1}>
    {label}
  </Text>
);

export const Value = ({label, size = 's'}) => (
  <Text
    style={[baseStyles.textStyle.secondaryText, baseStyles.textSize[size]]}
    numberOfLines={1}>
    {label}
  </Text>
);

const LabelsAndValues = ({items, size, expanded = false, column = false}) => (
  <View style={[styles.container]}>
    <View style={[styles.labels({expanded})]}>
      {items.map(({label, value}) => (
        <View key={label}>
          {!Objects.isEmpty(value) && <Label label={label} size={size} />}
          {column && <Value label={value} size={size} />}
        </View>
      ))}
    </View>
    {!column && (
      <View style={[styles.values({expanded})]}>
        {items.map(({label, value = '-'}) => (
          <Value key={label} label={value} size={size} />
        ))}
      </View>
    )}
  </View>
);

export default LabelsAndValues;
