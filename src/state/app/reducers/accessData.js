import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appAccessData = handleActions(
  {
    [actions.setAccessData]: (state, {payload: {username, password}}) => ({
      ...state,
      username,
      password,
    }),
  },
  initialState.accessData || {},
);

export default appAccessData;