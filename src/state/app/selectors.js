import {createSelector} from 'reselect';

import initialState from './initial.state';

const getState = state => state?.app;

const getAccessData = createSelector(
  getState,
  app => app?.accessData || initialState.accessData,
);
const getPreferences = createSelector(
  getState,
  app => app?.preferences || initialState.preferences,
);
const getServerUrl = createSelector(
  getPreferences,
  preferences => preferences?.serverUrl,
);

const getUi = createSelector(getState, app => app?.ui || initialState.ui);
const getIsLoading = createSelector(getUi, ui => ui?.isLoading);
const getError = createSelector(getUi, ui => ui?.error);

const getShowNames = createSelector(getUi, ui => ui?.showNames);

export default {
  getAccessData,
  getServerUrl,

  getUi,
  getIsLoading,
  getError,

  getShowNames,
};
