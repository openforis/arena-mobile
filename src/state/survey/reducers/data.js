import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setSurvey]: (_, {payload: {survey = {}}}) => survey,
    [actions.cleanSurvey]: () => initialState.data || {},
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
