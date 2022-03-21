import React from 'react';
import {Text, View} from 'react-native';

import baseStyles from '../../styles';
import Button from '../Button';

import styles from './styles';

const Empty = ({title, info, ctaLabel, onPress}) => {
  return (
    <View style={[styles.container]}>
      <View>
        <Text style={[baseStyles.textStyle.title]}>{title}</Text>

        <Text
          style={[
            baseStyles.textStyle.text,
            baseStyles.textSize.xl,
            styles.info,
          ]}>
          {info}
        </Text>
      </View>

      <Button type="primary" label={ctaLabel} onPress={onPress} />
    </View>
  );
};

export default Empty;
