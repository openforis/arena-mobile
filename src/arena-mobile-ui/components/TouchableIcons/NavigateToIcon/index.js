import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';

import TouchableIcon from '../TouchableIcon';

const NavigateToIcon = ({route, icon, replace = false}) => {
  const navigation = useNavigation();
  const navigate = useCallback(
    () => (replace ? navigation.replace(route) : navigation.navigate(route)),
    [route, navigation, replace],
  );
  return <TouchableIcon onPress={navigate} iconName={icon} />;
};

export default NavigateToIcon;
