import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const preferences = handleActions(
  {
    [actions.setHasToJump]: (state, {payload: {hasToJump}}) => ({
      ...state,
      hasToJump,
    }),
    [actions.setHasToLockRecordsWhenLeave]: (
      state,
      {payload: {hasToLockRecordsWhenLeave}},
    ) => ({
      ...state,
      hasToLockRecordsWhenLeave,
    }),
  },
  initialState.preferences || {},
);

export default preferences;
