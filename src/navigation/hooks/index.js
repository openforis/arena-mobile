import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';

import {ROUTES} from '../constants';

export const useNavigateTo = () => {
  const navigation = useNavigation();

  const navigateTo = useCallback(
    ({route, replace = false}) =>
      () =>
        replace ? navigation.replace(route) : navigation.navigate(route),

    [navigation],
  );

  return {navigateTo, routes: ROUTES};
};
