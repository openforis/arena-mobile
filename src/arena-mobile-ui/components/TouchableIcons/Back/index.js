import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';

import TouchableIcon from '../TouchableIcon';

const style = StyleSheet.create({
  container: {
    width: baseStyles.bases.BASE_16,
    height: baseStyles.bases.BASE_16,
  },
});

const Back = () => {
  const navigation = useNavigation();
  return (
    <TouchableIcon
      onPress={navigation.goBack}
      iconName={'chevron-left'}
      hitSlop={baseStyles.bases.BASE_16}
      customStyle={style.container}
    />
  );
};

export default Back;
