import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setSurvey]: (state, {payload: {survey}}) => ({
      ...state,
      [survey.info.id]: {...survey},
    }),
    [actions.deleteSurvey]: (state, {payload: {surveyId}}) => {
      let newState = {...state};
      delete newState[surveyId];
      return newState;
    },
  },
  initialState.accessData || {},
);

export default data;
