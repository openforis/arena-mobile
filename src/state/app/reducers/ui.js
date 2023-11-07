import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appUi = handleActions(
  {
    [actions.setLoading]: (state, {payload: {isLoading}}) => ({
      ...state,
      isLoading: isLoading,
    }),
    [actions.cleanErrors]: state => ({
      ...state,
      serverError: false,
      credentialsError: false,
    }),
    [actions.setServerError]: state => ({
      ...state,
      serverError: true,
    }),

    [actions.setCredentialsError]: state => ({
      ...state,
      credentialsError: true,
    }),

    [actions.setShowNames]: (state, {payload: {showNames}}) => ({
      ...state,
      showNames,
    }),
    [actions.initConnection]: state => ({
      ...state,
      serverError: false,
      credentialsError: false,
      isLoading: true,
    }),
    [actions.setDevMode]: state => ({
      ...state,
      devMode: true,
    }),
    [actions.disableDevMode]: state => ({
      ...state,
      devMode: false,
    }),
    [actions.setStyleBaseModifier]: (state, {payload: {baseModifier = 1}}) => ({
      ...state,
      style: {
        ...state.style,
        baseModifier,
      },
    }),
    [actions.setStyleFontBaseModifier]: (
      state,
      {payload: {fontBaseModifier = 1}},
    ) => ({
      ...state,
      style: {
        ...state.style,
        fontBaseModifier,
      },
    }),
    [actions.setStyleColorScheme]: (
      state,
      {payload: {colorScheme = 'light'}},
    ) => ({
      ...state,
      style: {
        ...state.style,
        colorScheme,
      },
    }),
    [actions.setApplicationLanguage]: (
      state,
      {payload: {applicationLanguage = 'en'}},
    ) => ({
      ...state,
      applicationLanguage,
    }),
  },
  initialState.ui,
);

export default appUi;
