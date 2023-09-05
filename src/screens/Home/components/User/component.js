import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import NotLoggedIn from 'arena-mobile-ui/components/NotLoggedIn';
import {selectors as userSelectors} from 'state/user';

import LoggedInAs from './components/LoggedInAs';

const User = () => {
  const user = useSelector(userSelectors.getUser);

  return <View>{user?.name ? <LoggedInAs /> : <NotLoggedIn />}</View>;
};

export default User;
