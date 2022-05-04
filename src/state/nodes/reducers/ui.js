import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const ui = handleActions(
  {
    [actions.setLoading]: (state, {payload: {isLoading}}) => ({
      ...state,
      isLoading: isLoading,
    }),
    [actions.setError]: (state, {payload: {error}}) => ({
      ...state,
      error: error,
    }),
  },
  initialState.ui || {},
);

export default ui;
