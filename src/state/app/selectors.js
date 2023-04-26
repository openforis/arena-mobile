import {isTablet} from 'react-native-device-info';
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
  preferences => preferences?.serverUrl || 'https://www.openforis-arena.org',
);

const getUi = createSelector(getState, app => app?.ui || initialState.ui);
const getIsLoading = createSelector(getUi, ui => ui?.isLoading);

const getServerError = createSelector(getUi, ui => ui?.serverError);
const getCredentialsError = createSelector(getUi, ui => ui?.credentialsError);
const isDevModeEnabled = createSelector(getUi, ui => ui?.devMode);

const getShowNames = createSelector(getUi, ui => ui?.showNames);
const getIsTablet = createSelector(getUi, () => isTablet?.() || false);

/* Preferences settings */

const getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields =
  createSelector(
    getPreferences,
    preferences =>
      preferences?.settings?.survey?.taxonomies?.defaultVisibleFields || null,
  );

export default {
  getAccessData,
  getServerUrl,

  getUi,
  getIsLoading,
  getIsTablet,

  getServerError,
  getCredentialsError,
  isDevModeEnabled,

  getShowNames,

  /* Preferences settings */
  getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
};
