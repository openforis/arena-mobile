import {Objects} from '@openforis/arena-core';
import React from 'react';
import {View, Text} from 'react-native';

import baseStyles from '../../styles';

import styles from './styles';

export const Label = ({label, size = 's', bolder = false}) => (
  <Text
    style={[
      baseStyles.textStyle.secondaryText,
      bolder ? baseStyles.textStyle.bolder : baseStyles.textStyle.bold,
      baseStyles.textSize[size],
    ]}
    numberOfLines={1}>
    {label}
  </Text>
);

export const Value = ({label, size = 's', bolder = false, color = null}) => (
  <Text
    style={[
      baseStyles.textStyle.secondaryText,
      baseStyles.textSize[size],
      bolder ? baseStyles.textStyle.bold : {},
      color ? styles.color[color] : {},
    ]}
    numberOfLines={1}>
    {label}
  </Text>
);

const LabelsAndValues = ({items, size, expanded = false, column = false}) => (
  <View style={[styles.container]}>
    <View style={[styles.labels({expanded})]}>
      {items.map(({label, value, bolder}) => (
        <View key={label}>
          {!Objects.isEmpty(value) && (
            <Label label={label} size={size} bolder={bolder} />
          )}
          {column && <Value label={value} size={size} bolder={bolder} />}
        </View>
      ))}
    </View>
    {!column && (
      <View style={[styles.values({expanded})]}>
        {items.map(({label, value = '-', bolder, color}) => (
          <Value
            key={label}
            label={value}
            size={size}
            bolder={bolder}
            color={color}
          />
        ))}
      </View>
    )}
  </View>
);

export default LabelsAndValues;
