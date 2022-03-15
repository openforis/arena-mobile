import {createActions} from 'redux-actions';

import types from './actionTypes';

const {app} = createActions({
  [types.initConnection$]: ({username, password, serverUrl}) => ({
    username,
    password,
    serverUrl,
  }),
  [types.SET_ACCESS_DATA]: ({username, password = ''}) => ({
    username,
    password,
  }),
  /*ui*/
  [types.SET_LOADING]: ({isLoading = false}) => ({
    isLoading,
  }),
  [types.SET_ERROR]: ({error = false}) => ({
    error,
  }),
});

export default app;
