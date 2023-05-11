import {Objects} from '@openforis/arena-core';
import React from 'react';
import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import styles from './styles';

export const Label = ({label, size = 's', bolder = false}) => (
  <TextBase type={bolder ? 'bolder' : 'bold'} size={size} numberOfLines={1}>
    {label}
  </TextBase>
);

export const Value = ({label, size = 's', bolder = false, color = null}) => (
  <TextBase
    type={bolder ? 'bolder' : 'bold'}
    size={size}
    customStyle={[color ? styles.color[color] : {}]}
    numberOfLines={1}>
    {label}
  </TextBase>
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
