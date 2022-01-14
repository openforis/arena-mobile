import React from 'react';

import {useNavigation} from '@react-navigation/native';

import TouchableIcon from '../TouchableIcon';

const Back = () => {
  const navigation = useNavigation();
  return (
    <TouchableIcon
      onPress={navigation.goBack}
      iconName={'chevron-back-outline'}
    />
  );
};

export default Back;
