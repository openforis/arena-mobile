import {useNavigation} from '@react-navigation/native';
import React from 'react';

import baseStyles from 'arena-mobile-ui/styles';

import TouchableIcon from '../TouchableIcon';

const Back = () => {
  const navigation = useNavigation();
  return (
    <TouchableIcon
      onPress={navigation.goBack}
      iconName={'chevron-left'}
      hitSlop={baseStyles.bases.BASE_16}
    />
  );
};

export default Back;
