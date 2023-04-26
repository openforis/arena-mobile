import {createActions} from 'redux-actions';

import types from './actionTypes';

const {user} = createActions({
  [types.SET_USER]: ({user: _user}) => ({user: _user}),
  [types.CLEAN_USER]: () => ({}),
});

export default user;
