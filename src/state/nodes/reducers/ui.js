import {handleActions} from 'redux-actions';

import formActions from 'state/form/actionCreators';
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
    [actions.updateNode]: (state, {payload: {updatedNode}}) => ({
      ...state,
      lastNodeDefUuid: updatedNode.nodeDefUuid,
    }),
    [formActions.setNode]: (state, {payload: {node}}) => ({
      ...state,
      lastNodeDefUuid: node?.nodeDefUuid
        ? node?.nodeDefUuid
        : state.lastNodeDefUuid,
    }),
    [globalActions.reset]: () => initialState.ui || {},
  },
  initialState.ui || {},
);

export default ui;
