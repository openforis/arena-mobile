import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as userSelectors} from 'state/user';

import LoggedInAs from './components/LoggedInAs';
import NotLoggedIn from './components/NotLoggedIn';

const User = () => {
  const user = useSelector(userSelectors.getUser);

  return <View>{user?.name ? <LoggedInAs /> : <NotLoggedIn />}</View>;
};

export default User;
