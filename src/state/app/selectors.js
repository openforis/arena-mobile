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

const getShowNames = createSelector(
  getUi,
  ui => false, //ui?.showNames
);

const getIsTablet = createSelector(getUi, () => isTablet?.() || false);

const getStyle = createSelector(getUi, ui => ui?.style);

/* Preferences settings */

const getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields =
  createSelector(
    getPreferences,
    preferences =>
      preferences?.settings?.survey?.taxonomies?.defaultVisibleFields || null,
  );

const getSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName =
  createSelector(
    getPreferences,
    preferences =>
      preferences?.settings?.survey?.taxonomies
        ?.showOneOptionPerVernacularName || false,
  );

const getBaseModifier = createSelector(
  getStyle,
  style => style?.baseModifier || 1,
);

const getFontBaseModifier = createSelector(
  getStyle,
  style => style?.fontBaseModifier || 1,
);

const getColorScheme = createSelector(
  getStyle,
  style => style?.colorScheme || 'light',
);

const hasToUseMapsMeAsDefault = createSelector(
  getPreferences,
  preferences => preferences?.settings?.geo?.hasToUseMapsMeAsDefault,
);

/* this is to avoid the error with the slider if there is some array stored from a previous version*/
const ifArrayReturnFirstValue = value => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

/* Image setting */
const getImagesCompressQuality = createSelector(getPreferences, preferences =>
  ifArrayReturnFirstValue(
    preferences?.settings?.images?.compressQuality || 0.5,
  ),
);

const getImagesCompressMaxHeight = createSelector(getPreferences, preferences =>
  ifArrayReturnFirstValue(
    preferences?.settings?.images?.compressMaxHeight || 1024,
  ),
);

const getImagesCompressMaxWidth = createSelector(getPreferences, preferences =>
  ifArrayReturnFirstValue(
    preferences?.settings?.images?.compressMaxWidth || 1024,
  ),
);

const getIsMaxResolution = createSelector(
  getPreferences,
  preferences => preferences?.settings?.images?.isMaxResolution || false,
);

/* application language */
const getApplicationLanguage = createSelector(
  getUi,
  ui => ui?.applicationLanguage || 'en',
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

  // theme
  getBaseModifier,
  getFontBaseModifier,
  getColorScheme,

  /* Preferences settings */
  getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  getSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName,

  /* Image setting */
  getImagesCompressQuality,
  getImagesCompressMaxHeight,
  getImagesCompressMaxWidth,
  getIsMaxResolution,

  /* Pref: GEO */
  hasToUseMapsMeAsDefault,
  /* application language */
  getApplicationLanguage,
};
