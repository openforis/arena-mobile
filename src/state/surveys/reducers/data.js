import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setSurvey]: (state, {payload: {survey}}) => ({
      ...state,
      [survey?.info?.uuid]: {...survey},
    }),
    [actions.deleteSurvey]: (state, {payload: {surveyUuid}}) => {
      let newState = {...state};
      delete newState[surveyUuid];
      return newState;
    },
  },
  initialState.accessData || {},
);

export default data;
