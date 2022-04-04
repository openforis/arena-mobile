import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setSurvey]: (_, {payload: {survey = {}}}) => survey,
  },
  initialState.accessData || {},
);

export default data;
