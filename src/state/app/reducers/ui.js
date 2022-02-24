import {handleActions} from 'redux-actions';

import actions from '../actionCreators';
import initialState from '../initial.state';

const appUi = handleActions(
  {
    [actions.setLoading]: (state, {payload: isLoading}) => ({
      ...state,
      loading: isLoading,
    }),
  },
  initialState.ui || {},
);

export default appUi;
