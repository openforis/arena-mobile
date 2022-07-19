import {useNavigation} from '@react-navigation/native';
import React from 'react';

import TouchableIcon from '../TouchableIcon';

const Back = () => {
  const navigation = useNavigation();
  return (
    <TouchableIcon
      onPress={navigation.goBack}
      iconName={'chevron-left'}
      hitSlop={36}
    />
  );
};

export default Back;
