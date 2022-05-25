import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appUi = handleActions(
  {
    [actions.setLoading]: (state, {payload: {isLoading}}) => ({
      ...state,
      isLoading: isLoading,
    }),
    [actions.setError]: (state, {payload: {error}}) => ({
      ...state,
      error: error,
    }),
    [actions.setShowNames]: (state, {payload: {showNames}}) => ({
      ...state,
      showNames,
    }),
    [actions.initConnection]: state => ({
      ...state,
      error: false,
      isLoading: true,
    }),
  },
  initialState.ui,
);

export default appUi;
