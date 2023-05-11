import {handleActions} from 'redux-actions';

import actions from './actionCreators';
import initialState from './initial.state';

const data = handleActions(
  {
    [actions.setUser]: (state, {payload: {user}}) => user || state,
    [actions.cleanUser]: () => initialState,
  },
  initialState || {},
);

export default data;
