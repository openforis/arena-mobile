import {createActions} from 'redux-actions';

import types from './actionTypes';

const {app} = createActions({
  [types.initConnection$]: ({username, password, serverUrl}) => ({
    username,
    password,
    serverUrl,
  }),
  [types.logout$]: () => ({}),
  [types.SET_ACCESS_DATA]: ({username = '', password = ''}) => ({
    username,
    password,
  }),
  [types.SET_SERVER_URL]: ({serverUrl = ''}) => ({
    serverUrl,
  }),
  [types.CLEAN]: () => ({}),
  [types.SET_SERVER_URL]: ({serverUrl = ''}) => ({
    serverUrl,
  }),
  /*ui*/
  [types.SET_LOADING]: ({isLoading = false}) => ({
    isLoading,
  }),
  [types.CLEAN_ERRORS]: () => ({}),

  [types.SET_SERVER_ERROR]: ({error = false}) => ({
    error,
  }),
  [types.SET_CREDENTIALS_ERROR]: ({error = false}) => ({
    error,
  }),
  [types.SET_SHOW_NAMES]: ({showNames = false}) => ({
    showNames,
  }),
  [types.SET_DEV_MODE]: () => ({}),
  [types.DISABLE_DEV_MODE]: () => ({}),
  /* Preferences settings */
  [types.SET_SETTINGS_PREFERENCES_SURVEY_TAXONOMIES_DEFAULT_VISIBLE_FIELDS]: ({
    defaultVisibleFields = null,
  }) => ({
    defaultVisibleFields,
  }),
  /* Style settings */
  [types.SET_STYLE_BASE_MODIFIER]: ({baseModifier = 1}) => ({
    baseModifier,
  }),
  [types.SET_STYLE_FONT_BASE_MODIFIER]: ({fontBaseModifier = 1}) => ({
    fontBaseModifier,
  }),
});

export default app;
