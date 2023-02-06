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
  [types.SET_SERVER_URL]: ({serverUrl}) => ({
    serverUrl,
  }),
  /*ui*/
  [types.SET_LOADING]: ({isLoading = false}) => ({
    isLoading,
  }),
  [types.SET_ERROR]: ({error = false}) => ({
    error,
  }),
  [types.SET_SHOW_NAMES]: ({showNames = false}) => ({
    showNames,
  }),
  [types.SET_DEV_MODE]: () => ({}),
  [types.DISABLE_DEV_MODE]: () => ({}),
});

export default app;
