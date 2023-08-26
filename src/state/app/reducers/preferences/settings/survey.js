import {handleActions} from 'redux-actions';

import actions from '../../../actionCreators';
import initialState from '../../../initial.state';

const survey = handleActions(
  {
    [actions.setSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields]: (
      state,
      {payload: {defaultVisibleFields = null}},
    ) => ({
      ...state,
      taxonomies: {
        ...state?.taxonomies,
        defaultVisibleFields,
      },
    }),
    [actions.setSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName]:
      (state, {payload: {showOneOptionPerVernacularName = false}}) => ({
        ...state,
        taxonomies: {
          ...state?.taxonomies,
          showOneOptionPerVernacularName,
        },
      }),
  },
  initialState.preferences?.settings?.survey,
);

export default survey;
