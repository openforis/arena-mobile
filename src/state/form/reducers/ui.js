import {handleActions} from 'redux-actions';

import globalActions from 'state/globalActions';

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
    [actions.toggleEntitySelector]: state => ({
      ...state,
      isEntitySelectorOpened: !state.isEntitySelectorOpened,
    }),
    [actions.closeEntitySelector]: state => ({
      ...state,
      isEntitySelectorOpened: false,
    }),
    [actions.toggleEntityShowAsTable]: state => ({
      ...state,
      isEntityShowAsTable: !state.isEntityShowAsTable,
    }),

    [actions.selectEntityNode]: state => ({
      ...state,
      isEntityShowAsTable: false,
    }),
    [actions.clean]: () => initialState.ui,
    [globalActions.reset]: () => initialState.ui || {},
  },
  initialState.ui || {},
);

export default ui;
