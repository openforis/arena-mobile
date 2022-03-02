import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';

import TouchableIcon from '../TouchableIcon';

const NavigateToIcon = ({route, icon}) => {
  const navigation = useNavigation();
  const navigate = useCallback(
    () => navigation.navigate(route),
    [route, navigation],
  );
  return <TouchableIcon onPress={navigate} iconName={icon} />;
};

export default NavigateToIcon;
