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
    [actions.cleanAccessData]: state => ({
      ...state,
      username: initialState.accessData.username,
      password: initialState.accessData.password,
    }),
    [actions.clean]: () => initialState.accessData,
  },
  initialState.accessData,
);

export default appAccessData;
