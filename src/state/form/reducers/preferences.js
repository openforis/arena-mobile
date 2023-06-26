import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const preferences = handleActions(
  {
    [actions.setHasToJump]: (state, {payload: {hasToJump}}) => ({
      ...state,
      hasToJump,
    }),
  },
  initialState.preferences || {},
);

export default preferences;
