import {handleActions} from 'redux-actions';

import actions from '../../../actionCreators';
import initialState from '../../../initial.state';

const geoAppPreferences = handleActions(
  {
    [actions.setGeoHasToUseMapsMeAsDefault]: (
      state,
      {payload: {hasToUseMapsMeAsDefault}},
    ) => ({
      ...state,
      hasToUseMapsMeAsDefault,
    }),
  },
  initialState.preferences?.settings?.geo,
);

export default geoAppPreferences;
