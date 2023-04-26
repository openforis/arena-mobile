import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appPreferences = handleActions(
  {
    [actions.setServerUrl]: (state, {payload: {serverUrl = ''}}) => ({
      ...state,
      serverUrl,
    }),
    [actions.setSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields]: (
      state,
      {payload: {defaultVisibleFields = null}},
    ) => ({
      ...state,
      settings: {
        ...state.settings,
        survey: {
          ...state?.settings?.survey,
          taxonomies: {
            ...state?.settings?.survey.taxonomies,
            defaultVisibleFields,
          },
        },
      },
    }),
  },
  initialState.preferences,
);

export default appPreferences;
