import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setSurvey]: (state, {payload: {survey}}) => ({
      ...state,
      [survey?.uuid]: {...survey},
    }),
    [actions.deleteSurvey]: (state, {payload: {surveyUuid}}) => {
      let newState = {...state};
      delete newState[surveyUuid];
      return newState;
    },
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.accessData || {},
);

export default data;
